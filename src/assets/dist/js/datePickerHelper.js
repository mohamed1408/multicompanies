export var daterangepicker = function (id, callback) {
    function cb(start, end) {
        // console.log(start, end)
        $('#' + id + ' span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        $.each($(".box"), function () {
            if ($(this).is(":hidden")) {
                // hiddenBoxes.push($(this).text());
                console.log('loader btn click')
                $(this)[0].click();
            }
        });
        callback(start, end)
    }

    $('#' + id).daterangepicker({
        startDate: moment(),
        endDate: moment(),
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    return cb
}