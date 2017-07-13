var Data = {
    
    //подгрузка данных
    getDataFor : function(start, duration, f) {
        var points = null;
        Data.request.getData('data.csv').then(function(response) {
            points = response;
            var arrayX = [],
                arrayY = [],
                end = start + duration,
                l = points.x.length;

            for (var i = 0; i < l; i++) {
                if (points.x[i] >= start && points.x[i] <= end) {
                    arrayX.push(points.x[i] - start);
                    arrayY.push(points.y[i]);
                    //console.log(2);
                }
            }

            var x = new Int32Array(arrayX),
                y = new Int32Array(arrayY);

            f({
                x: x,
                y: y
            }, start);

        });
    },

    request : {
        get : function(url) {
            return new Promise(function(resolve, reject) {

                var req = new XMLHttpRequest();
                req.open('GET', url);

                req.onload = function() {

                    if (req.status == 200) {
                        resolve(req.response);
                    } else {
                        reject(Error(req.statusText));
                    }
                };

                req.onerror = function() {
                    reject(Error("Network Error"));
                };

                req.send();
            });
        },

        //после отправки url получает просто текст из файла и отдаёт на обработку в следующую функцию
        getData : function(url) {
            return Data.request.get(url).then(Data.request.parseData);
        },

        //разбирает на два массива
        parseData : function(data) {
            //console.log(data);
            var arr = data.split('\n');
            var l = arr.length - 1;
            var arrayX = [],
                arrayY = [],
                tmp = null;
            for (var i = 1; i < l; i++) {
                tmp = arr[i].split(', ');
                arrayX.push(Number(tmp[0]));
                arrayY.push(Number(tmp[1]));
            }
            //console.log(arrayY);
            //console.log(arrayX);

            return {
                x: arrayX,
                y: arrayY
            };
        }
    }
};