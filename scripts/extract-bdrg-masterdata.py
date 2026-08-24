import csv,re,sys,urllib.request
from pathlib import Path
import pdfplumber

SOURCE='https://www.bdrg.de/media/user_upload/Rassenverzeichnis_BDRG_2024.pdf'
CATEGORIES={'Puten','Perlhühner','Gänse','Enten','Hühner','Zwerghühner','Wachteln','Ziergeflügel'}
TAUBEN_GROUPS={'Formentauben','Warzentauben','Huhntauben','Kropftauben','Farbentauben','Schweizer Farbentauben','Trommeltauben','Strukturtauben','Mövchentauben','Tümmlertauben','Spielflugtauben'}
SKIP_RE=re.compile(r'^(?:[ab]\)|–|alle |auch |oder |anderer |ausschließlich |bei |sowie |in allen |ohne |und )',re.I)
BAD_RE=re.compile(r'(Rassen- und Farbenschläge|BDRG \d|^\d+$|∙|Schnabellänge|Handschwingen)',re.I)
BREED_FIXES={'Ägyptische Segler Swift)':'Ägyptische Segler (Egyptian Swift)','Syrische Segler (Syrian':'Syrische Segler (Syrian Swift)','Einfarbige Mövchen Owls)':'Einfarbige Mövchen (African Owls)','Deutsche Gabelschwanz-':'Deutsche Gabelschwanz-Trommeltauben'}
COLOR_FIXES={'Blau-silberfarbiggebändert Orangenrücken':'Blau-silberfarbiggebändert mit Orangenrücken','Erbsgelb mit Binden Binden)':'Erbsgelb mit Binden (Gelbfahl mit Binden)','Erbsgelb-gemöncht (Gelbfahl-gemöncht':'Erbsgelb-gemöncht (Gelbfahl-gemöncht)','Isabell-eulig mit Binden eulig mit Binden)':'Isabell-eulig mit Binden (Khakifahl-eulig mit Binden)','Isabellfarbig mit Binden mit Binden)':'Isabellfarbig mit Binden (Khakifahl mit Binden)','Isabellfarbig-geelstert geelstert)':'Isabellfarbig-geelstert (Khakifahl-geelstert)','Weißköpfe Erbsgelb (Weißköpfe Gelbfahl':'Weißköpfe Erbsgelb mit Binden (Weißköpfe Gelbfahl mit Binden)','Weißschwänze Isabellfarbig Binden (Khakifahl':'Weißschwänze Isabellfarbig mit Binden (Khakifahl mit Binden)'}

def lines_for_column(page,col,start):
    words=[]
    for w in page.extract_words(extra_attrs=['fontname','size']):
        if not 55<w['top']<578: continue
        nearest=min(range(3),key=lambda i:abs(w['x0']-(start+118*i)))
        if nearest==col and start+118*col-2<=w['x0']<start+118*(col+1)-2:
            words.append(w)
    groups=[]
    for w in sorted(words,key=lambda x:(x['top'],x['x0'])):
        if not groups or abs(groups[-1][0]['top']-w['top'])>1.2: groups.append([w])
        else: groups[-1].append(w)
    result=[]
    for group in groups:
        group.sort(key=lambda x:x['x0']);text=' '.join(w['text'] for w in group).strip()
        bold=all('Bold' in w['fontname'] for w in group)
        italic=any('Italic' in w['fontname'] for w in group)
        result.append({'text':text,'bold':bold,'italic':italic,'size':max(w['size'] for w in group),'indent':min(w['x0'] for w in group)-(start+118*col),'top':group[0]['top']})
    return result

def extract(pdf_path):
    records=[];ambiguous=[];category=None;group_name=None;breed=None;colors=[];order=0;pending_large=None;breed_top=None;breed_scope=None
    def finish():
        nonlocal colors,breed,order,breed_top,breed_scope
        if not breed:return
        breed=BREED_FIXES.get(breed,breed)
        clean_colors=[]
        for color in colors:
            color=re.sub(r'\s+',' ',color).strip(' ;,')
            color=COLOR_FIXES.get(color,color)
            if color and color not in clean_colors:clean_colors.append(color)
        if not clean_colors:
            clean_colors=['ohne eigenen Farbenschlag']
            ambiguous.append(f'Rasse ohne expliziten Farbenschlag: {category} / {group_name} / {breed}')
        for color in clean_colors:
            order+=1;records.append({'category':category,'breed_group':group_name or category,'breed':breed,'color_variant':color,'sort_order':order,'active':'true','source':SOURCE,'source_version':'BDRG 2024'})
        colors=[];breed_top=None;breed_scope=None
    with pdfplumber.open(pdf_path) as pdf:
        for page_index,page in enumerate(pdf.pages):
            start=69.27 if page_index%2==0 else 43.68
            for col in range(3):
                for line in lines_for_column(page,col,start):
                    if page_index==0 and line['top']<205:continue
                    text=line['text'].replace('–','-').strip()
                    if not text or BAD_RE.search(text):continue
                    if line['bold'] and line['size']>8.5:
                        combined=(pending_large+' '+text).strip() if pending_large else text
                        if combined=='Schweizer Farbentauben': text=combined;pending_large=None
                        elif text=='Schweizer':pending_large=text;continue
                        else:pending_large=None
                        finish();breed=None
                        if text in CATEGORIES:
                            category=text;group_name=text
                        elif text in TAUBEN_GROUPS:
                            category='Tauben';group_name=text
                        else: ambiguous.append(f'Unbekannte große Überschrift Seite {page_index+1}: {text}')
                        continue
                    pending_large=None
                    if not category:continue
                    if line['bold']:
                        if category=='Tauben' and text==group_name:continue
                        scope=(page_index,col)
                        wraps=breed and not colors and (breed.endswith('-') or line['indent']>2 or (breed_scope==scope and breed_top is not None and line['top']-breed_top<9.5))
                        if wraps:
                            breed=f'{breed} {text}'
                        else:
                            finish();breed=text;colors=[]
                        breed_top=line['top'];breed_scope=scope
                        continue
                    if line['italic'] or SKIP_RE.match(text):continue
                    if not breed:
                        if category=='Perlhühner':breed='Perlhühner'
                        else:
                            ambiguous.append(f'Text ohne Rasse Seite {page_index+1}, Spalte {col+1}: {text}');continue
                    if colors and (line['indent']>2 or colors[-1].endswith('-') or text[:1].islower()):
                        if colors[-1].endswith('-'):colors[-1]=colors[-1]+text
                        else:colors[-1]=colors[-1]+' '+text
                    else:colors.append(text)
    finish()
    return records,ambiguous

def validate(records):
    errors=[];seen=set()
    for i,row in enumerate(records,2):
        if not row['breed'].strip():errors.append(f'Zeile {i}: leere Rasse')
        if BAD_RE.search(row['breed']) or BAD_RE.search(row['color_variant']):errors.append(f'Zeile {i}: Kopf-/Fußzeile erkannt')
        key=(row['category'].casefold(),row['breed_group'].casefold(),row['breed'].casefold(),row['color_variant'].casefold())
        if key in seen:errors.append(f'Zeile {i}: Dublette {key}')
        seen.add(key)
    return errors

def main():
    pdf=Path(sys.argv[1] if len(sys.argv)>1 else 'tmp/pdfs/Rassenverzeichnis_BDRG_2024.pdf');out=Path('data/bdrg-rassen-farbschlaege.csv')
    if not pdf.exists():
        pdf.parent.mkdir(parents=True,exist_ok=True)
        request=urllib.request.Request(SOURCE,headers={'User-Agent':'Ausstellungsmanager BDRG masterdata importer'})
        with urllib.request.urlopen(request,timeout=60) as response,pdf.open('wb') as target:
            target.write(response.read())
    records,ambiguous=extract(pdf)
    unique={}
    for row in records:
        key=(row['category'].casefold(),row['breed_group'].casefold(),row['breed'].casefold(),row['color_variant'].casefold())
        if key in unique:ambiguous.append(f'Doppelte PDF-Zuordnung zusammengeführt: {row["category"]} / {row["breed_group"]} / {row["breed"]} / {row["color_variant"]}')
        else:unique[key]=row
    records=list(unique.values());errors=validate(records)
    if errors:raise SystemExit('\n'.join(errors[:50]))
    out.parent.mkdir(parents=True,exist_ok=True)
    with out.open('w',newline='',encoding='utf-8-sig') as f:
        writer=csv.DictWriter(f,fieldnames=['category','breed_group','breed','color_variant','sort_order','active','source','source_version']);writer.writeheader();writer.writerows(records)
    Path('data/bdrg-import-unklare-eintraege.txt').write_text('\n'.join(ambiguous)+'\n',encoding='utf-8')
    categories={r['category'] for r in records};groups={(r['category'],r['breed_group']) for r in records};breeds={(r['category'],r['breed_group'],r['breed']) for r in records};colors={r['color_variant'] for r in records}
    print(f'Kategorien: {len(categories)}\nRassegruppen: {len(groups)}\nRassen: {len(breeds)}\nFarbenschläge: {len(colors)}\nRasse/Farbenschlag-Kombinationen: {len(records)}\nUnklare Einträge: {len(ambiguous)}')
if __name__=='__main__':main()
