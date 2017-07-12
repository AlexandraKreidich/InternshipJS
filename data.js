var Data = {

    init : function () {
        //Data.generatePoints(Data.modifyArrayX(Data.arrayX), Data.arrayY);
    },

    //массив объектов для текущего графика ({x: x, y: y})
    POINTS : [],


    //подгрузка данных
    getDataFor: function(start, duration, f) {
        f({
            x: Int16Array
            ,y: Int16Array
        }, Graph.START_MS);
        //console.log("1::graph");
    },

    //сортировка данных по времени
    sortData: function(d) {
        d.sort(function(a, b) {
            return a.x - b.x;
        });
    },

    //метот для работы с координатами
    modifyArrayX: function(d) {
        for(var i = 0; i < d.length; i++)
            d[i] -= Graph.START_MS;
        return d;
    },

    //генерация массива объектов данных
    generatePoints: function(x, y) {
        var N = x.length;
        for (var i = 0; i < N; i++) {
            Data.POINTS[i] = {
                x: x[i],
                y: y[i]
            };
        }
    },

    arrayX: [
        1498000000229, 1498000007825, 1498000008981, 1498000016129, 1498000025722, 1498000031711, 1498000039954,
        1498000040859, 1498000043649, 1498000052088, 1498000053458, 1498000058979, 1498000064602, 1498000064770,
        1498000069831, 1498000073336, 1498000073715, 1498000073733, 1498000075231, 1498000079025, 1498000082903,
        1498000088451, 1498000098526, 1498000100888, 1498000107502, 1498000116566, 1498000117868, 1498000118738,
        1498000120249, 1498000123390, 1498000130065, 1498000132212, 1498000139280, 1498000145482, 1498000149021,
        1498000149597, 1498000151907, 1498000157578, 1498000169092, 1498000173194, 1498000174184, 1498000176368,
        1498000183866, 1498000187267, 1498000190797, 1498000192420, 1498000199438, 1498000206166, 1498000206910,
        1498000212932, 1498000213478, 1498000215784, 1498000217038, 1498000217737, 1498000221110, 1498000224219,
        1498000230599, 1498000234452, 1498000240002, 1498000244870, 1498000251987, 1498000257425, 1498000267535,
        1498000270973, 1498000287311, 1498000289104, 1498000297917, 1498000306171, 1498000309893, 1498000312291,
        1498000318541, 1498000321035, 1498000321709, 1498000327358, 1498000331664, 1498000333795, 1498000337042,
        1498000340856, 1498000346055, 1498000346527, 1498000361978, 1498000370855, 1498000391612, 1498000391945,
        1498000395648, 1498000395993, 1498000398297, 1498000404488, 1498000408392, 1498000413636, 1498000414278,
        1498000414660, 1498000417803, 1498000418449, 1498000430593, 1498000433971, 1498000434128, 1498000435806,
        1498000441289, 1498000451087, 1498000465731, 1498000466945, 1498000479194, 1498000480912, 1498000481484,
        1498000482428, 1498000485248, 1498000495869, 1498000496756, 1498000497195, 1498000506224, 1498000506715,
        1498000519164, 1498000520716, 1498000521151, 1498000521976, 1498000524615, 1498000525049, 1498000528084,
        1498000529362, 1498000530122, 1498000531098, 1498000533172, 1498000533919, 1498000534839, 1498000535535,
        1498000543922, 1498000543990, 1498000547292, 1498000561298, 1498000562663, 1498000562667, 1498000566975,
        1498000584586, 1498000585331, 1498000588389, 1498000590104, 1498000591627, 1498000594293, 1498000596552,
        1498000599022, 1498000599970, 1498000603593, 1498000603925, 1498000609668, 1498000611625, 1498000614981,
        1498000617780, 1498000618937, 1498000627655, 1498000639261, 1498000639574, 1498000641590, 1498000643517,
        1498000643777, 1498000651600, 1498000653721, 1498000654960, 1498000660440, 1498000676853, 1498000678499,
        1498000679503, 1498000679637, 1498000680289, 1498000680674, 1498000684492, 1498000686585, 1498000687585,
        1498000706168, 1498000707317, 1498000729078, 1498000734731, 1498000746617, 1498000756405, 1498000760162,
        1498000765905, 1498000774723, 1498000778266, 1498000779335, 1498000779402, 1498000779794, 1498000783890,
        1498000787873, 1498000791124, 1498000792168, 1498000804391, 1498000822530, 1498000825466, 1498000828141,
        1498000844481, 1498000845193, 1498000845644, 1498000855859, 1498000857167, 1498000868230, 1498000868584,
        1498000872004, 1498000874390, 1498000877261, 1498000879017
    ],

    arrayY: [
        826, 940, 726, 903, 727, 638, 627, 687, 528, 689, 797, 895, 635, 937, 1106, 579, 788, 1173, 1150, 571, 1106,
        785, 980, 1132, 930, 902, 845, 849, 1146, 725, 838, 1185, 501, 1069, 1140, 857, 930, 886, 533, 1165, 909, 525,
        1021, 1017, 518, 1086, 1111, 902, 967, 543, 647, 781, 943, 888, 906, 873, 993, 927, 1138, 746, 861, 960, 564,
        1110, 779, 1089, 1188, 510, 649, 971, 547, 870, 1197, 712, 721, 754, 738, 1199, 667, 905, 635, 723, 840, 1040,
        1023, 991, 1025, 917, 962, 815, 1108, 817, 1037, 1115, 679, 702, 896, 870, 527, 978, 1134, 1011, 700, 1113,
        1029, 547, 1142, 596, 873, 1093, 1063, 521, 522, 610, 759, 943, 867, 507, 1187, 695, 1103, 788, 1093, 928, 963,
        1037, 1116, 529, 1082, 1174, 1069, 689, 824, 887, 1020, 1115, 976, 691, 910, 1109, 777, 937, 897, 510, 691,
        1060, 685, 1031, 714, 1048, 1097, 915, 507, 831, 1180, 959, 998, 518, 978, 802, 1191, 958, 624, 872, 860,
        1111, 826, 528, 899, 817, 1023, 952, 1010, 712, 916, 831, 1020, 731, 1043, 866, 926, 712, 989, 626, 817, 604,
        1019, 724, 1078, 571, 617, 1032, 531, 1091, 1193, 1125, 882, 708, 1084, 884
    ]

};
//сделать массив [{x:13215613,y:46132},...] отсортированные по x
