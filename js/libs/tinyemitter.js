(function (e) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = e()
    } else if (typeof define === "function" && define.amd) {
        define([], e)
    } else {
        var n;
        if (typeof window !== "undefined") {
            n = window
        } else if (typeof global !== "undefined") {
            n = global
        } else if (typeof self !== "undefined") {
            n = self
        } else {
            n = this
        }
        n.TinyEmitter = e()
    }
})(function () {
    var e, n, t;
    return function r(e, n, t) {
        function i(o, u) {
            if (!n[o]) {
                if (!e[o]) {
                    var s = typeof require == "function" && require;
                    if (!u && s) return s(o, !0);
                    if (f) return f(o, !0);
                    var a = new Error("Cannot find module '" + o + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var l = n[o] = {exports: {}};
                e[o][0].call(l.exports, function (n) {
                    var t = e[o][1][n];
                    return i(t ? t : n)
                }, l, l.exports, r, e, n, t)
            }
            return n[o].exports
        }

        var f = typeof require == "function" && require;
        for (var o = 0; o < t.length; o++) i(t[o]);
        return i
    }({
        1: [function (e, n, t) {
            function r() {
            }

            r.prototype = {
                on: function (e, n, t) {
                    var r = this.e || (this.e = {});
                    (r[e] || (r[e] = [])).push({fn: n, ctx: t});
                    return this
                }, once: function (e, n, t) {
                    var r = this;

                    function i() {
                        r.off(e, i);
                        n.apply(t, arguments)
                    }

                    i._ = n;
                    return this.on(e, i, t)
                }, emit: function (e) {
                    var n = [].slice.call(arguments, 1);
                    var t = ((this.e || (this.e = {}))[e] || []).slice();
                    var r = 0;
                    var i = t.length;
                    for (r; r < i; r++) {
                        t[r].fn.apply(t[r].ctx, n)
                    }
                    return this
                }, off: function (e, n) {
                    var t = this.e || (this.e = {});
                    var r = t[e];
                    var i = [];
                    if (r && n) {
                        for (var f = 0, o = r.length; f < o; f++) {
                            if (r[f].fn !== n && r[f].fn._ !== n) i.push(r[f])
                        }
                    }
                    i.length ? t[e] = i : delete t[e];
                    return this
                }
            };
            n.exports = r;
            n.exports.TinyEmitter = r
        }, {}]
    }, {}, [1])(1)
});