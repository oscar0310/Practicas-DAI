// ./components/Resultados.jsx 
import useSWR from 'swr';

//definimos un fetcher 
const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Resultados({ de }) {

    //Se comprueba que al menos se escriban 3 caracteres
    if (de.length < 3) return <div className="w-full text-center text-3x1 font-bold text-gray-500 mt-10"> al menos 3 caractéres </div>

    //Función que se encarga de los productos
    const ponProductos = (productos) => {
        if (!productos || productos.length === 0) return <div className="w-full text-center text-3x1 font-bold text-gray-500 mt-10" >No se encontraron productos.</div>; //verificamos que haya productos de ese tipo

        return (
            <div id="tarjetas" className="flex flex-wrap justify-center gap-4">
                {productos.map((producto) => (
                    <div key={producto._id} className="max-w-sm rounded overflow-hidden w-full sm:w-64 hover:shadow border border-rounded">
                        <img className="img_producto w-10/12 h-3/6 bg-gray-400 ml-5"
                            src={producto.url_img}
                            alt={producto.texto_1}/>
                            <div className="px-6 py-4">
                                <div className="nombre_producto mb-2 text-sm">{producto.texto_1}</div>
                                <div className="descripcion_producto text-gray-600 text-xs mb-2 h-12 overflow-hidden">{producto.texto_2}</div>
                                <p className="precio_producto text-gray-700 text-base">{producto.texto_precio}</p>
                            </div>
                            <div className="px-6 pb-2 text-center">
                                <span className="w-full inline-block rounded-full px-3 py-1 text-sm text-yellow-800 mr-2 mb-2 
                             border border-yellow-600 hover:bg-yellow-200">
                                    Añadir al carro
                                </span>
                            </div>
                    </div>
                ))}
            </div>
        )

    }
    // hook de swr, re-rendiriza en algún cambio de las variables
    const { data, error, isLoading } = useSWR(
        `/api/busqueda-anticipada/${de}`,
        fetcher
    );

    return (
        <div>
            {
                isLoading ? (
                    <h1>Cargando</h1>
                ) : data ? (
                    ponProductos(data)
                ) : error ? (<div>{error}</div>) : (<div>...</div>)
            }
        </div>
    )
}