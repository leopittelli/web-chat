(function() {
    const filterButton = document.querySelector('#apply-filter');
    let wasmModule;
    let filtering = false;

    function filter(imageData) {
        const bufferPointerIn = 1024,
            {data, width, height} = imageData,
            bufferIn = new Uint8Array(wasmModule.memory.buffer, bufferPointerIn, width * height * 4),
            bufferPointerOut = 2048 + width * height * 4,
            bufferOut = new Uint8Array(wasmModule.memory.buffer, bufferPointerOut, width * height * 4);

        bufferIn.set(data);
        wasmModule.outline_c(bufferPointerIn, bufferPointerOut, width, height);
        data.set(bufferOut);
        return data;
    }

    async function loadWasm() {
        const response = await fetch('/public/wasm-filter.wasm'),
            wasmFile = await response.arrayBuffer(),
            compiledModule = await WebAssembly.compile(wasmFile),
            wasmModule = await WebAssembly.instantiate(compiledModule, {
                env: {
                    random: max => Math.floor(Math.random() * max),
                    logInt: console.log
                }
            });

        return wasmModule.exports;
    }

    function toggleFiltering(e) {
        filtering = !filtering;

        if (filtering) {
            filterButton.textContent = 'Cancelar filtro';
            captureImage.setFilter(filter);
        } else {
            filterButton.textContent = 'Aplicar filtro';
            captureImage.removeFilter();
        }

        e.preventDefault();
    }

    async function main() {
        wasmModule = await loadWasm();
        filterButton.style.display = 'inline-block';
    }

    filterButton.addEventListener('click', toggleFiltering, false);

    main()
        .catch(console.error);
})();