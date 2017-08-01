var Data = {

    //подгрузка данных
    getDataFor: function (start, duration, f) {
        if (Data.Cache.containsInterval(start, duration)) {
            Data.Cache.getInterval(start, duration);
        } else {
            Data.Request.getData('data.csv').then(function (response) {
                Data.processData(response, start, duration, f);
                Data.Cache.save(response.x, response.y);
            });
        }
    },

    processData: function (data, start, duration, f) {
        //console.log(data);

        var arrayX = [],
            arrayY = [],
            end = start + duration,
            l = data.x.length;

        for (var i = 0; i < l; i++) {
            if (data.x[i] >= start && data.x[i] <= end) {
                arrayX.push(data.x[i] - start);
                arrayY.push(data.y[i]);
            }
        }

        var x = new Int32Array(arrayX),
            y = new Int32Array(arrayY);

        f({
            x: x,
            y: y
        }, start);

    },

    Request: {
        get: function (url) {
            return new Promise(function (resolve, reject) {

                var req = new XMLHttpRequest();
                req.open('GET', url);

                req.onload = function () {

                    if (req.status === 200) {
                        resolve(req.response);
                    } else {
                        reject(Error(req.statusText));
                    }
                };

                req.onerror = function () {
                    reject(Error("Network Error"));
                };

                req.send();
            });
        },

        //после отправки url получает просто текст из файла и отдаёт на обработку в следующую функцию
        getData: function (url) {
            return Data.Request.get(url).then(Data.Request.parseData);
        },

        //разбирает на два массива
        parseData: function (data) {
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
    },

    //перевод метки времени в формат ГГГГ-ММ-ДД
    tsToData: function (ts) {
        var fullData = new Date(ts),
            year = fullData.getFullYear(),
            month = fullData.getMonth() + 1,
            day = fullData.getDate();

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return year + '-' + month + '-' + day;
    },

    //перевод метки времени в формат ЧЧ:ММ:СС
    tsToTime: function (ts) {
        var fullData = new Date(ts),
            hours = fullData.getHours(),
            minutes = fullData.getMinutes(),
            seconds = fullData.getSeconds();

        if (hours < 10) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;

        return hours + ':' + minutes + ':' + seconds;
    },

    Cache: {
        containsInterval: function (start, duration) {
            return; //true/false
        },

        getInterval: function (start, duration) {

            //получаем
        },

        save: function (X, Y) {
            if (Data.Cache.Data.x.length === 0) {
                Data.Cache.Data.x = X;
                Data.Cache.Data.y = Y;
                console.log(Data.Cache.Data);
            }

            else {
                var x_start = Data.Cache.findPoint(X[0], 'less'),
                    x_end = Data.Cache.findPoint(X[X.length - 1], 'more'),
                    tmp = {
                        x: [],
                        y: []
                    };
                if (x_start === -1 && x_end === -1) {
                    Data.Cache.Data.x = X;
                    Data.Cache.Data.y = Y;
                }
                else if (x_start === -1) {
                    tmp.x = X;
                    tmp.y = Y;
                    tmp.x = Data.Cache.Data.x.slice(x_end, Data.Cache.Data.x.length);
                    tmp.y = Data.Cache.Data.y.slice(x_end, Data.Cache.Data.y.length);
                }
                else if (x_end === -1) {
                    tmp.x = Data.Cache.Data.x.slice(0, x_start + 1);
                    tmp.y = Data.Cache.Data.y.slice(0, x_start + 1);
                    tmp.x = tmp.x.concat(X);
                    tmp.y = tmp.y.concat(Y);
                }
                else {
                    tmp.x = Data.Cache.Data.x.slice(0, x_start + 1);
                    tmp.y = Data.Cache.Data.y.slice(0, x_start + 1);
                    tmp.x = tmp.x.concat(X);
                    tmp.y = tmp.y.concat(Y);
                    tmp.x = Data.Cache.Data.x.slice(x_end, Data.Cache.Data.x.length);
                    tmp.y = Data.Cache.Data.y.slice(x_end, Data.Cache.Data.y.length);
                }

                Data.Cache.Data = tmp;
            }
        },
        //находит точку и возвращает номер елемента массива для неё
        //бинарный поиск
        findPoint: function (point, flag) {
            var start = 0,
                end = Data.Cache.Data.x.length - 1,
                midF = Math.floor((start + end) / 2),
                midS = Math.ceil((start + end) / 2);

            var i = 0;

            while (start < end) {
                i++;
                if (i > 200) {
                    return -1;
                }
                if (midF === midS) midS += 1;
                else if (point < Data.Cache.Data.x[midF] && point < Data.Cache.Data.x[midS]) {
                    end = midF;
                }
                else if (point > Data.Cache.Data.x[midF] && point > Data.Cache.Data.x[midS]) {
                    start = midS;
                }
                else {
                    if (flag === 'less') {
                        return midF;
                    }
                    else if (flag === 'more') {
                        if (Data.Cache.Data.x[midS + 1] === undefined)
                            return midS;
                        else
                            return midS + 1;
                    }
                }
                midF = Math.floor((start + end) / 2);
                midS = Math.ceil((start + end) / 2);
            }
            return -1;
        },

        Data: {
            x: [],
            y: []
        }
    }
};