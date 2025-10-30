# PRACTICA 1.1 OBTENCIÓN DE DATOS CON EL PARSER DE HTML.
En esta práctica hemos aprendido a obtener datos con el parser de html:
- Primero con las herramientas del navegador hemos obtenido el código HTML de la página web del mercadona.
- Segundo  hemos instalado las dependencias para el parser con:
> npm install node-html-parser
- Tercero en el archivo package.json añadimos la información del proyecto.

```javascript
    {
        "main": "parser.js",
        "type": "module",
        "dependencies": {
            "node-html-parser": "^7.0.1"
        }
    }
```
## ACTIVIDADES 
- Como actividades se proponen dos:
1. Se modifica el parser inicial para que funciones con una lista de archivos, para solucionarlo:

```javascript
    const lista_archivos = {'aceites.html':'aceites.html','fisioterapia.html': 'fisioterapia.html'} //Creamos una lista 
    const valores=Object.keys(lista_archivos) //obtenemos el valor 
    //Realizamos un bucle iterando por cada archivo
    for(const valor of valores){ //Iteramos para cada valor
        //Lógica del programa
    }
```
2. Incluir también datos de las subcategorías para cada producto:

```javascript
    for(const valor of valores){ //Iteramos para cada valor(Itera por los archivos)
        const html = Lee_archivo(valor)
        const root = parse(html)

        const categoría = Arregla_texto(root.querySelector('h1').text) //Obtenemos la categoría

        const lista_secciones=root.querySelectorAll('section.section') //Obtenemos la subsección 
        for(const seccion of lista_secciones){  //Iteramos por cada subseccion, son section de la clase section 
            const subcategoría = Arregla_texto(seccion.querySelector('h2').text) //Nos quedamos con el titulo de la subsección
            const lista_productos = seccion.querySelectorAll('div.product-cell') //Obtenemos los productos de la subsección
            for (const producto of lista_productos) { //  Iteramos por todos los productos
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
```