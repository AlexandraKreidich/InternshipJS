var Data = {

    // подгрузка данных
    getDataFor: function (start, duration, f) {
        // копируем все что есть в базе данных в кеш
        // проверяем наличие нужного отрезка в кеше
        // если есть то берем из кеша,
        // если нету то делаем AJAX запрос:
        // сохраняем эти данные в кеш и в БД

        // проверяем наличие БД и создаем ее если неду доступной версии
        if (Data.WebSQL.dataBase === null) {
            Data.WebSQL.intiDataBase().then(Data.WebSQL.createTable).then(Data.WebSQL.copyToCache).then(Data.Request.interactionToCache(start, duration, f));
        }
        else {
            Data.Request.interactionToCache(start, duration, f);
        }
    },

    // обработка полученных данных для дальнейшего использования
    processData: function (data, start, duration, f) {
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

        arrayX = arrayX.map(function (e) {
            return e + start;
        });

        Data.Cache.save(arrayX, arrayY);
        Data.WebSQL.save(arrayX, arrayY);


        f({
            x: x,
            y: y
        }, start);

    },

    // пространство имен для работы с запросами к серверу
    Request: {
        // получение данных с сервера
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

        // после отправки url получает просто текст из файла и отдаёт на обработку в следующую функцию
        getData: function (url) {
            //console.log('request');
            return Data.Request.get(url).then(Data.Request.parseData);
        },

        // разбирает на два массива
        parseData: function (data) {
            //console.log(data);
            var arr = data.split('\n'),
                l = arr.length - 1,
                arrayX = [],
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
        },

        // проверяет наличие запрашиваемых данных в кеше, если нет, то делает запрос на сервер
        interactionToCache: function (start, duration, f) {
            console.log('4 - запрос на сервер, если не нашло нужные данные');
            if (Data.Cache.containsInterval(start, duration)) {
                console.log('cache');
                f(Data.Cache.getInterval(start, duration), start);
            }
            else {
                Data.Request.getData('data.csv').then(function (response) {
                    console.log('request');
                    Data.processData(response, start, duration, f);
                    //console.log(Data.Cache.Data.x.length);
                });
            }
        }
    },

    // перевод метки времени в формат ГГГГ-ММ-ДД
    tsToData: function (ts) {
        var fullData = new Date(ts),
            year = fullData.getFullYear(),
            month = fullData.getMonth() + 1,
            day = fullData.getDate();

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return year + '-' + month + '-' + day;
    },

    // перевод метки времени в формат ЧЧ:ММ:СС
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

    //пространство имен для работы с кешем
    Cache: {
        // проверяет наличие требуемого интервала в кэше (возвращает true/false)
        containsInterval: function (start, duration) {
            return this.findPoint(start).first !== -1 && this.findPoint(start + duration).second !== -1 && this.Data.x.length !== 0;
        },

        // получаем заданный интервал из кэша
        getInterval: function (start, duration) {
            var l = this.Data.x.length,
                arrayX = [],
                arrayY = [],
                end = start + duration;

            for (var i = 0; i < l; i++) {
                if (this.Data.x[i] >= start && this.Data.x[i] <= end) {
                    arrayX.push(this.Data.x[i] - start);
                    arrayY.push(this.Data.y[i]);
                }
            }

            var x = new Int32Array(arrayX),
                y = new Int32Array(arrayY);

            return {
                x: x,
                y: y
            };
        },

        // сохранение данных в кеш
        save: function (X, Y) {
            // X - массив иксовых координат точек, которые нужно сохранить
            // Y - соответствующие иксам значения по оси игрек
            // Мы хотим вставить X и Y в кеш, не разрушая упорядоченность точек.

            //DEBUG
            // var seed = 1498000000000;
            // console.log((X[0] - seed) + " ..(" + X.length + ").. " + (X[X.length - 1] - seed));
            // console.log((this.Data.x[0] - seed) + " ..(" + this.Data.x.length + ").. " + (this.Data.x[this.Data.x.length - 1] - seed));

            if (window.conds) window.conds = [];
            if (this.Data.x.length === 0) {
                // если данных нет в кэше
                // console.log(1);
                this.Data.x = X;
                this.Data.y = Y;
            }

            else {
                var x_start = this.findPoint(X[0]).first,
                    x_end = this.findPoint(X[X.length - 1]).second,
                    tmp = {
                        x: [],
                        y: []
                    };

                if (x_start === -1 && x_end === -1) {
                    // если записываемые данные содержат в себе отрезок, который уже существует
                    // console.log(2);
                    tmp.x = X;
                    tmp.y = Y;
                }
                else if (x_start === -1) {
                    // если записываемый отрезок строго правее данных в кэше
                    // console.log(3);
                    tmp.x = X;
                    tmp.y = Y;
                    tmp.x = tmp.x.concat(this.Data.x.slice(x_end, this.Data.x.length));
                    tmp.y = tmp.y.concat(this.Data.y.slice(x_end, this.Data.y.length));
                }
                else if (x_end === -1) {
                    // если записываемый отрезок строго левее данных в кэше
                    // console.log(4);
                    tmp.x = this.Data.x.slice(0, x_start + 1);
                    tmp.y = this.Data.y.slice(0, x_start + 1);
                    tmp.x = tmp.x.concat(X);
                    tmp.y = tmp.y.concat(Y);
                }
                else {
                    // записываемые данные пересекаются, но не содержат данные в кэше
                    // console.log(5);
                    tmp.x = this.Data.x.slice(0, x_start + 1);
                    tmp.y = this.Data.y.slice(0, x_start + 1);
                    tmp.x = tmp.x.concat(X);
                    tmp.y = tmp.y.concat(Y);
                    tmp.x = tmp.x.concat(this.Data.x.slice(x_end, Data.Cache.Data.x.length));
                    tmp.y = tmp.y.concat(this.Data.y.slice(x_end, Data.Cache.Data.y.length));
                }
                this.Data.x = tmp.x;
                this.Data.y = tmp.y;
            }
        },

        // функция поиска индекса элемента:
        // возвращает индекс элемента в кэшированном массиве, который является минимальным из всех,
        // что строго больше переданного первым аргументом
        // (максимальным среди всех, что строго меньше)
        // (бинарный поиск)
        findPoint: function (point) {
            // point - точка для которой мы ищем индекса

            // левый конец (индекс) рассматриваемого на текущей итерации отрезка
            var start = 0,
                //положение конца (правый конец)
                end = Data.Cache.Data.x.length - 1,
                //первое среднее значение (индекс)
                midF = Math.floor((start + end) / 2),
                //второе среднее значение (индекс)
                midS = Math.ceil((start + end) / 2),
                //итератор для незацикливания
                i = 0,
                X = Data.Cache.Data.x;

            if (point <= X[0]) {
                if (point < X[0]) {
                    return {first: -1, second: 0};
                }
                return {first: -1, second: 1};
            }
            else if (point >= X[X.length - 1]) {
                if (point > X[X.length - 1]) {
                    return {first: X.length - 1, second: -1};
                }
                else {
                    return {first: X.length - 2, second: -1};
                }
            }
            else {
                while (start < end) {
                    i++;
                    if (i > 200) {
                        console.error('Number of operations exceeded');
                        return -2;
                    }
                    if (midF === midS) {
                        //console.log(midF, midS)
                        midS += 1;
                    }
                    if (point < X[midF]) {
                        //console.log(1)
                        end = midF;
                    }
                    else if (point > X[midS]) {
                        start = midS;
                        //console.log(2);
                    }
                    else {
                        if (point === X[midF]) {
                            return {first: midF - 1, second: midS};
                        }
                        else if (point === X[midS]) {
                            return {first: midF, second: midS + 1};
                        }
                        else return {first: midF, second: midS};
                    }
                    midF = Math.floor((start + end) / 2);
                    midS = Math.ceil((start + end) / 2);
                }
                return -1;
            }
        },

        // объект данных кеша
        Data: {
            x: [],
            y: []
        }
    },

    // пространство для работы с WebSQL - DataBase;
    WebSQL: {

        // память базы данных
        MEMORY: 5 * 1024 * 1024,

        // база данных
        dataBase: null,

        // создает базу данных или подключается к существующей
        intiDataBase: function () {
            console.log('1 - подключение к БД');
            return new Promise(function (resolve, reject) {
                if (Data.WebSQL.dataBase === null) {
                    Data.WebSQL.dataBase = openDatabase("Points", "", "Points", this.MEMORY);
                    if (Data.WebSQL.dataBase === null) {
                        console.error("Failed to connect!");
                    }
                    // + создаем таблицу с данными
                    resolve(); //Data.WebSQL.createTable();
                }
            });
        },

        // создает таблицу
        createTable: function () {
            console.log('2 - создание таблицы');
            return new Promise(function (resolve, reject) {
                if (Data.WebSQL.dataBase.version !== '0.1') {
                    Data.WebSQL.dataBase.changeVersion(Data.WebSQL.dataBase.version, '0.1', function (tx) {
                        console.log('Connection completed');
                        console.log('version : "' + Data.WebSQL.dataBase.version + '"');
                        Data.WebSQL.dataBase.transaction(function (tx) {
                            tx.executeSql('DROP TABLE IF EXISTS DATA', [],
                                function () {
                                    tx.executeSql('CREATE TABLE IF NOT EXISTS DATA (point INTEGER, value INTEGER)', [],
                                        function () {
                                        }, function () {
                                            console.error('DATA did not created');
                                        });
                                },
                                function () {
                                    console.error('DATA did not deleted');
                                });

                        })
                    });
                }
                else {
                    console.log('Already exist!');
                    console.log('version : "' + Data.WebSQL.dataBase.version + '"');
                    resolve(); //this.copyToCache()

                }
            });
        },

        // копирует данные из БД в кеш
        copyToCache: function () {
            console.log('3 - копирование данных их БД в кеш');
            return new Promise(function (resolve, reject) {
                Data.WebSQL.dataBase.transaction(function (tx) {
                    var tmp = [];
                    tx.executeSql('SELECT distinct point, value FROM DATA', [],
                        function (tx, result) {
                            var l = result.rows.length;
                            for (var i = 0; i < l; i++) {
                                tmp[i] = {x: result.rows.item(i).point, y: result.rows.item(i).value};
                            }
                            tmp.sort(function (a, b) {
                                return a.x - b.x;
                            });
                            // сохранение в кеш
                            for (i = 0; i < l; i++) {
                                Data.Cache.Data.x[i] = tmp[i].x;
                                Data.Cache.Data.y[i] = tmp[i].y;
                            }
                            console.log(Data.Cache.Data);
                            resolve(); // Data.Request.interactionToCache(start, duration, f))
                        },
                        function (tx, error) {
                            console.error(error);
                        });
                });
            });
        },

        // функция сохранения в базу данных
        save: function (X, Y) {
            var l = X.length;
            Data.WebSQL.dataBase.transaction(function (tx) {
                for (var i = 0; i < l; i++) {
                    tx.executeSql('INSERT INTO DATA (point, value) VALUES (?, ?)', [X[i], Y[i]], null,
                        function () {
                            console.error('Cant save points!');
                        });
                }
            });
        }
    }
};