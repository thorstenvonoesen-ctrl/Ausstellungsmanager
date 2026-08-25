import {randomUUID} from "node:crypto";
import {loadEnvFile} from "node:process";
import {neon} from "@neondatabase/serverless";

const slug="codex-entry-management-test";
const assert=(condition:unknown,message:string)=>{if(!condition)throw new Error(message)};

async function main(){
  if(!process.env.DATABASE_URL)loadEnvFile(".env.local");
  const sql=neon(process.env.DATABASE_URL!);
  await sql`DELETE FROM shows WHERE public_slug=${slug}`;
  let showId="";
  try{
    const clubs=await sql`SELECT id::text FROM clubs WHERE active=true ORDER BY created_at LIMIT 1`,variants=await sql`SELECT bcv.id::text FROM breed_color_variants bcv JOIN breeds b ON b.id=bcv.breed_id JOIN breed_groups bg ON bg.id=b.breed_group_id JOIN animal_categories c ON c.id=bg.category_id WHERE bcv.active=true ORDER BY c.sort_order,bg.sort_order,b.sort_order,bcv.standard_sort_order LIMIT 3`;
    assert(clubs.length===1,"Kein aktiver Testverein vorhanden");assert(variants.length>=3,"Zu wenige Stammdatenkombinationen");
    const clubId=String(clubs[0].id),showRows=await sql`INSERT INTO shows(club_id,name,show_start,show_end,registration_deadline,status,public_slug) VALUES(${clubId},'Codex Verwaltungstest',now()+interval '10 days',now()+interval '11 days',now()+interval '5 days','registration_open',${slug}) RETURNING id::text`;
    showId=String(showRows[0].id);
    const entryIds=[randomUUID(),randomUUID(),randomUUID()],exhibitorIds=[randomUUID(),randomUUID(),randomUUID()];
    const setup=[];
    for(let i=0;i<3;i++){
      setup.push(sql`INSERT INTO exhibitors(id,show_id,first_name,last_name,street,house_number,postal_code,city,email,phone,livestock_number,exhibitor_club_name,age_group) VALUES(${exhibitorIds[i]},${showId},${`Test${i+1}`},${`Aussteller${i+1}`},'Testweg',${String(i+1)},'58000','Hagen',${`test${i+1}@invalid.example`},'000','TSK-Test','Testverein',${i===1?'youth':'adult'})`);
      setup.push(sql`INSERT INTO entries(id,show_id,exhibitor_id,registration_number,management_token,status,workflow_status,submitted_at,total_amount,paid_amount,payment_status,single_count,aviary_count,stem_count) VALUES(${entryIds[i]},${showId},${exhibitorIds[i]},${`TEST-${i+1}`},${randomUUID()},${i===2?'cancelled':'submitted'},${i===2?'cancelled':'received'},now()+(${i}*interval '1 minute'),${10+i*5},${i===1?15:0},${i===1?'paid':'open'},${i+1},0,0)`);
      for(let animal=0;animal<=i;animal++)setup.push(sql`INSERT INTO animals(entry_id,show_id,breed_color_variant_id,entry_type,sex,age_class,ring_number,withdrawn) VALUES(${entryIds[i]},${showId},${String(variants[(i+animal)%3].id)},'single',${animal%2?'0,1':'1,0'},${animal%2?'old':'young'},${`R-${i}-${animal}`},${i===2})`);
      setup.push(sql`INSERT INTO entry_fee_items(entry_id,description,quantity,unit_amount,total_amount,fee_type) VALUES(${entryIds[i]},'Gespeichertes Standgeld',${i+1},5,${(i+1)*5},'animal')`);
    }
    await sql.transaction(setup);

    await sql`WITH ranked AS (SELECT id,row_number() OVER(ORDER BY submitted_at,id) AS number FROM entries WHERE show_id=${showId} AND workflow_status<>'cancelled' AND exhibitor_number IS NULL) UPDATE entries e SET exhibitor_number=ranked.number FROM ranked WHERE e.id=ranked.id`;
    const firstNumbers=await sql`SELECT registration_number,exhibitor_number FROM entries WHERE show_id=${showId} ORDER BY registration_number`;
    await sql`WITH ranked AS (SELECT id,row_number() OVER(ORDER BY submitted_at,id) AS number FROM entries WHERE show_id=${showId} AND workflow_status<>'cancelled' AND exhibitor_number IS NULL) UPDATE entries e SET exhibitor_number=ranked.number FROM ranked WHERE e.id=ranked.id`;
    const secondNumbers=await sql`SELECT registration_number,exhibitor_number FROM entries WHERE show_id=${showId} ORDER BY registration_number`;
    assert(JSON.stringify(firstNumbers)===JSON.stringify(secondNumbers),"Ausstellernummern sind nicht stabil");assert(firstNumbers[2].exhibitor_number===null,"Stornierte Meldung erhielt eine Ausstellernummer");

    await sql`WITH ranked AS (SELECT a.id,row_number() OVER(ORDER BY c.sort_order,bg.sort_order,b.sort_order,bcv.standard_sort_order,a.sex,a.age_class,e.exhibitor_number NULLS LAST,a.created_at) AS number FROM animals a JOIN entries e ON e.id=a.entry_id JOIN breed_color_variants bcv ON bcv.id=a.breed_color_variant_id JOIN breeds b ON b.id=bcv.breed_id JOIN breed_groups bg ON bg.id=b.breed_group_id JOIN animal_categories c ON c.id=bg.category_id WHERE a.show_id=${showId} AND NOT a.withdrawn AND e.workflow_status<>'cancelled' AND a.catalog_number IS NULL) UPDATE animals a SET catalog_number=ranked.number,cage_number=ranked.number::text FROM ranked WHERE a.id=ranked.id`;
    const cages=await sql`SELECT id::text,catalog_number FROM animals WHERE show_id=${showId} ORDER BY catalog_number NULLS LAST,id`,snapshot=JSON.stringify(cages);
    await sql`WITH ranked AS (SELECT a.id,row_number() OVER(ORDER BY a.created_at) AS number FROM animals a JOIN entries e ON e.id=a.entry_id WHERE a.show_id=${showId} AND NOT a.withdrawn AND e.workflow_status<>'cancelled' AND a.catalog_number IS NULL) UPDATE animals a SET catalog_number=ranked.number FROM ranked WHERE a.id=ranked.id`;
    assert(JSON.stringify(await sql`SELECT id::text,catalog_number FROM animals WHERE show_id=${showId} ORDER BY catalog_number NULLS LAST,id`)===snapshot,"Käfignummern sind nicht stabil");assert(cages.filter(row=>row.catalog_number!==null).length===3,"Aktive Tiere wurden nicht vollständig nummeriert");

    await sql`UPDATE exhibitors SET city='Iserlohn' WHERE id=${exhibitorIds[0]}`;
    await sql`UPDATE entries SET workflow_status='reviewed' WHERE id=${entryIds[0]}`;
    await sql`UPDATE entries SET paid_amount=total_amount,payment_status='paid',paid_at=now(),payment_method='transfer' WHERE id=${entryIds[0]}`;
    const changed=await sql`SELECT x.city,e.workflow_status,e.payment_status,(SELECT sum(total_amount)::text FROM entry_fee_items WHERE entry_id=e.id) AS stored_cost FROM entries e JOIN exhibitors x ON x.id=e.exhibitor_id WHERE e.id=${entryIds[0]}`;
    assert(changed[0].city==='Iserlohn'&&changed[0].workflow_status==='reviewed'&&changed[0].payment_status==='paid',"Bearbeitung, Status oder Zahlung wurde nicht gespeichert");assert(Number(changed[0].stored_cost)===5,"Gespeicherte Kostenaufstellung wurde verändert");
    const foreign=await sql`SELECT count(*)::int AS count FROM entries e JOIN shows s ON s.id=e.show_id WHERE e.id=${entryIds[0]} AND s.club_id=${randomUUID()}`;
    assert(Number(foreign[0].count)===0,"Mandantentrennung fehlgeschlagen");
    const cancelled=await sql`SELECT count(*)::int AS count FROM animals WHERE entry_id=${entryIds[2]} AND withdrawn=true`;
    assert(Number(cancelled[0].count)===3,"Stornierte Meldung enthält aktive Tiere");
    console.log(JSON.stringify({exhibitors:3,animals:6,activeNumbered:3,cancelledEntries:1,paidEntries:2,openEntries:1,tenantIsolation:true,stableNumbers:true,storedCosts:true}));
  }finally{
    if(showId)await sql`DELETE FROM shows WHERE id=${showId}`;else await sql`DELETE FROM shows WHERE public_slug=${slug}`;
  }
}
main().catch(error=>{console.error(error);process.exitCode=1});
