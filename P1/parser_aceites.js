import fs from 'node:fs'

// https://github.com/taoqf/node-html-parser
// se instala
// npm i node-html-parser
import { parse } from 'node-html-parser';


// Para acumular la informácion de los productos
const Info = []

// cambiar el programa para usar una lista de varios archivos html
// con distintas categorías
// elemento:
//<div class="grid-layout__main-container" style="height: calc(-76px + 100vh)">
// ...
// </div>

const lista_archivos = {'aceites.html':'P1/aceites.html','fisioterapia.html': 'P1/fisioterapia.html'} //Creamos una lista 
const valores=Object.keys(lista_archivos) //obtenemos el valor 

for(const valor of valores){ //Iteramos para cada valor
	const html = Lee_archivo(valor)
	const root = parse(html)

	const categoría = Arregla_texto(root.querySelector('h1').text)

	const lista_secciones=root.querySelectorAll('section.section')
	for(const seccion of lista_secciones){
		const subcategoría = Arregla_texto(seccion.querySelector('h2').text)
		const lista_productos = seccion.querySelectorAll('div.product-cell')
		for (const producto of lista_productos) {
			const img = producto.querySelector("img");
			const url_img = img.attrs.src;
			const texto_1 = img.attrs.alt;
			const t2 = producto.querySelector("div.product-format");
			const texto_2 = Arregla_texto(t2.text);
			const texto_precio = Arregla_texto(
			producto.querySelector("div.product-price").innerText
			);
			const r1 = texto_precio.match(/(\d+),?(\d+)?(.+)/);
			//console.log(r1)
			const precio_euros =
			r1.length > 2 ? Number(r1[1] + "." + r1[2]) : undefined;
			const info_prod = {
			categoría,
			subcategoría,
			url_img,
			texto_1,
			texto_2,
			texto_precio,
			precio_euros,
			};
			Info.push(info_prod);
		}
	}
}
const string_para_guardar_en_fomato_json = JSON.stringify(Info, null, 2)

try {
	fs.writeFileSync('datos_mercadona.json', string_para_guardar_en_fomato_json)
	console.log('Guardado archivo')
} catch (error) {
	console.error('Error guardando archivo: ', error)
}


function Arregla_texto(texto) {
	let arreglado = texto.replace('\n', '')
	arreglado = arreglado.replace(/\s+/g, ' ')
	return arreglado.trim()
}


function Lee_archivo(archivo) {
    try {
        return fs.readFileSync(archivo, 'utf8')
    } catch (error) {
        console.error('Error leyendo archivo: ', error);
    }
}
