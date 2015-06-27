(function () {
    var eoraptor = {
        name: 'eoraptorjs',
        version: '#VERSION#',
        compile: compile,
        // setDelimiter: setDelimiter,
        escape: escaper,
        // extract: extract,
        debug: false,
        _: {
            e: escaper,
            v: value
        }
    };
    return eoraptor;
})();