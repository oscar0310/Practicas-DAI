//./components/Navegacion.jsx
export default function Navegacion({ onInput }) {
    return ( // Devuelve la barra de navegación
        <header className="flex items-center justify-between px-8 py-3 bg-white shadow-sm gap-4">

            <div className="flex items-baseline gap-4 min-w-fit">
                <h1 className="text-2xl font-bold text-gray-700 tracking-tight">Tienda DAI</h1>
                <span className="text-gray-500 text-sm hidden md:block">Busqueda anticipada</span>
            </div>

            <div className="flex-grow max-w-3xl mx-4">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <i className="fa-solid fa-magnifying-glass text-gray-500"></i>
                    </div>

                    <input
                        type="text"
                        id="input-busqueda"
                        className="w-full py-2.5 pl-12 pr-4 text-gray-800 bg-gray-50 border-2 border-green-500 rounded-full focus:outline-none focus:bg-white transition-colors"
                        placeholder="Buscar productos..."
                        autocomplete="off"
                        onInput={onInput} 
                    />
                </div>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium min-w-fit">
                <a href="#" className="hover:text-green-600 transition-colors">Categorías</a>
                <a href="#" className="hover:text-green-600 transition-colors">Listas</a>

                <a href="#" className="hover:text-green-600 transition-colors flex items-center gap-1">
                    Identifícate
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                </a>

                <a href="#" className="hover:text-green-600 transition-colors flex items-center gap-2">
                    Carrito <i className="fa-solid fa-cart-shopping text-xl"></i>
                </a>
            </div>
        </header>
    )
}