function test(exp) 
{
    var x = 1, y = 1, z = 1, u = 1, v = 1, w = 1, q = 1, r = Math.E;
    return x*Math.pow(y*exp, z) + u*exp +  v * Math.log(w*exp + r) / Math.log(r); 
}

function testn(x, y, z, u, v, w, q, r) 
{
    function subtest(exp)
    {
        return (x*Math.pow(y*exp, z) + u*exp +  v * Math.log(w*exp + r) / Math.log(r) + q) | 0; 
    }

    return [subtest(100), subtest(3600), subtest(3600*8), subtest(3600*200),  subtest(3600*400), subtest(3600*1000)];
}


