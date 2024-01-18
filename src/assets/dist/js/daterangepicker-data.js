var from = moment();//.subtract(29, 'days');
var to = moment();
var companyid = localStorage.getItem("loginInfo") ? JSON.parse(localStorage.getItem("loginInfo")).CompanyId : 0;
var storeid = 0;

function sortTable() {
	var table, rows, switching, i, x, y, shouldSwitch, switchcount = 0;
	table = document.getElementById("storewise-sales");
	switching = true;
	dir = "asc";

	/*Make a loop that will continue until
	no switching has been done:*/
	while (switching) {
		//start by saying: no switching is done:
		switching = false;
		rows = table.rows;
		/*Loop through all table rows (except the
		first, which contains table headers):*/
		for (i = 1; i < (rows.length - 1); i++) {
			//start by saying there should be no switching:
			shouldSwitch = false;
			/*Get the two elements you want to compare,
			one from current row and one from the next:*/
			x = +rows[i].getElementsByTagName("TD")[2].innerText.split('₹')[1].split(',').join('');
			y = +rows[i + 1].getElementsByTagName("TD")[2].innerText.split('₹')[1].split(',').join('');
			//check if the two rows should switch place:
			if (dir == "asc") {
				if (x > y) {
					shouldSwitch = true;
					break;
				}
			} else if (dir == "desc") {
				if (x < y) {
					shouldSwitch = true;
					break;
				}
			}
		}
		if (shouldSwitch) {
			/* If a switch has been marked, make the switch
			and mark that a switch has been done: */
			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
			switching = true;
			switchcount++;
		} else {
			/* If no switching has been done AND the direction is "asc",
			set the direction to "desc" and run the while loop again. */
			if (switchcount == 0 && dir == "asc") {
				dir = "desc";
				switching = true;
			}
		}
	}
}

$(function () {
	"use strict";
	/* Date range with a callback*/

	$('input[name="daterange"]').daterangepicker({
		opens: 'left',
		"cancelClass": "btn-secondary",
	}, function (start, end, label) {
		console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
	});

	/* Date range picker with times*/
	$('input[name="datetimes"]').daterangepicker({
		timePicker: true,
		startDate: moment().startOf('hour'),
		endDate: moment().startOf('hour').add(32, 'hour'),
		"cancelClass": "btn-secondary",
		locale: {
			format: 'M/DD hh:mm A'
		}
	});

	/* Single table*/
	$('input[name="birthday"]').daterangepicker({
		singleDatePicker: true,
		showDropdowns: true,
		minYear: 1901,
		"cancelClass": "btn-secondary",
		maxYear: parseInt(moment().format('YYYY'), 10)
	}, function (start, end, label) {
		var years = moment().diff(start, 'years');
		alert("You are " + years + " years old!");
	});

	/* Limit selectable dates*/
	$('.input-limit-datepicker').daterangepicker({
		format: 'MM/DD/YYYY',
		minDate: '06/01/2018',
		maxDate: '06/30/2018',
		buttonClasses: ['btn', 'btn-sm'],
		"cancelClass": "btn-secondary",
		dateLimit: {
			days: 6
		}
	});

	/* Predefind range*/
	var start = moment();//.subtract(29, 'days');
	var end = moment();

	function cb(start, end) {
		$('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
		from = start.format('YYYY-MM-DD');
		to = end.format('YYYY-MM-DD');
		storeid = ($('#store_select')[0]) ? +$('#store_select')[0].value : 0;
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": `https://biz1pos.azurewebsites.net/api/Dashboard/Post/?fromDate=${start.format('YYYY-MM-DD')}&toDate=${end.format('YYYY-MM-DD')}&compId=${companyid}&storeId=${storeid}&i=1`,
			"method": "GET",
			"headers": {
				"Authorization": `Bearer ${localStorage.getItem('jwt_token')}`,
				"Content-Type": "application/json"
			},
			"processData": false,
		}
		$.each($(".box"), function () {
			if ($(this).is(":hidden")) {
				// hiddenBoxes.push($(this).text());
				console.log('loader btn click')
				$(this)[0].click();
			}
		});
		$('#dashloader').show();
		// console.log("one")
		$.ajax(settings).done(function (response) {
			try {
				biz1ChartConfig(response);
				var nfObject = new Intl.NumberFormat('en-US');
				// console.log(response)
				if (!response.hasOwnProperty('error')) {
					// $('#bills')[0].innerText = (response.TotalSales[0].TotalBills == null) ? 0 : nfObject.format(response.TotalSales[0].TotalBills);
					// $('#payments')[0].innerText = (response.TotalSales[0].TotalSales == null) ? 0 : nfObject.format(response.TotalSales[0].TotalSales);
					// $('#no_of_bills')[0].innerText = (response.TotalSales[0].NoOfBills == null) ? 0 : nfObject.format(response.TotalSales[0].NoOfBills);
					// $('#new_customers')[0].innerText = (response.NewCustomers[0].TotNewCustomers == null) ? 0 : nfObject.format(response.NewCustomers[0].TotNewCustomers);
				}
				var cardinnerhtml = `<div class="card-header card-header-action">
										<h6>StoreWise Sales</h6>
										<div class="d-flex align-items-center card-action-wrap">
											<a href="#" class="inline-block refresh mr-15">
												<i class="ion ion-md-arrow-down"></i>
											</a>
											<a href="#" class="inline-block full-screen mr-15">
												<i class="ion ion-md-expand"></i>
											</a>
											<a class="inline-block card-close" href="#" data-effect="fadeOut">
												<i class="ion ion-md-close"></i>
											</a>
										</div>
									</div>
									<div class="card-body pa-0">
										<div class="table-wrap">
											<div class="table-responsive">
												<table id="storewise-sales" class="table table-sm table-hover mb-0">
													<thead>
														<tr>
															<th>Store</th>
															<th>Bills</th>
															<th style="cursor: pointer;" onclick="sortTable()">Payments</th>
															<th>No. of Bils</th>
														</tr>
													</thead>
													<tbody>`;
				var TotalBills = 0;
				var TotalSales = 0;
				var NoOfBills = 0;
				var storeTransactions = []
				storeTransactions = response["StoreTransactions"]
				if (response.hasOwnProperty('TotalSales')) {
					// console.log("before map")
					var TotalSalesArr = response.TotalSales.map(ts => {
						ts.Payments = storeTransactions.filter(x => x.Id == ts.StoreId)[0] ? storeTransactions.filter(x => x.Id == ts.StoreId)[0].Amount : 0
						return ts
					})
					// console.log("after map")
					TotalSalesArr = TotalSalesArr.sort((a, b) => (b.Payments - a.Payments))
					// console.log(TotalSalesArr)
					TotalSalesArr.forEach(element => {
						// console.log(element)
						TotalBills = TotalBills + element.TotalBills;
						TotalSales = TotalSales + element.TotalSales;
						NoOfBills = NoOfBills + element.NoOfBills;
						cardinnerhtml = cardinnerhtml +
							`<tr>
								<td>${element.Name}</td>
								<td>&#8377;${nfObject.format(element.TotalBills)}</td>
								<td>&#8377;${nfObject.format(element.Payments)}</td>
								<td>${nfObject.format(element.NoOfBills)}</td>
							</tr>`
					});
					// console.log("qwerty");
					cardinnerhtml = cardinnerhtml + `</tbody>
												</table>
											</div>
										</div>
									</div>`
					$('#bills')[0].innerText = (TotalBills == null) ? 0 : nfObject.format(TotalBills);
					$('#payments')[0].innerText = (response.Payments[0].Payments == null) ? 0 : nfObject.format(response.Payments[0].Payments);
					$('#no_of_bills')[0].innerText = (NoOfBills == null) ? 0 : nfObject.format(NoOfBills);
					$('#new_customers')[0].innerText = (response.NewCustomers[0].TotNewCustomers == null) ? 0 : nfObject.format(response.NewCustomers[0].TotNewCustomers);
					if (storeid == 0 && response.TotalSales.length > 0) {
						$('#storewisecard')[0].innerHTML = cardinnerhtml;
					} else {
						$('#storewisecard')[0].innerHTML = '';
					}
				} else {
					$('#storewisecard')[0].innerHTML = '';
				}
				var innerhtml = `<div class="card-header card-header-action">
				<h6>Top Products</h6>
			</div>
			<div class="card-body pa-0">
				<div class="table-wrap">
					<div class="table-responsive">
						<table class="table table-sm table-hover mb-0">
							<thead>
								<tr>
									<th>Product</th>
									<th class="w-40">Sales</th>
									<th class="w-25">Qty</th>
									<th>FreeQty</th>
								</tr>
							</thead>
							<tbody>`;
				if (response.hasOwnProperty('Top5Sales')) {
					response.Top5Sales.forEach(element => {
						innerhtml = innerhtml + `<tr>
						<td>${element.Product}</td>
						<td>
							<div class="progress-wrap lb-side-left mnw-125p">
								<div class="progress-lb-wrap">
									<label
										class="progress-label mnw-50p">&#8377;${element.Price}</label>
								</div>
							</div>
						</td>
						<td>${element.Quantity}</td>
						<td>
							 ${element.ComplementryQty}
						</td>
					</tr>`
					});
					innerhtml = innerhtml + `</tbody>
										</table>
									</div>
								</div>
							</div>`;
					if (response.Top5Sales.length > 0) {
						$('#dash_top_prods')[0].innerHTML = innerhtml;
					} else {
						$('#dash_top_prods')[0].innerHTML = ``;
					}
				} else {
					$('#dash_top_prods')[0].innerHTML = ``;
				}
				$.each($(".box"), function () {
					if ($(this).is(":hidden")) {
						// hiddenBoxes.push($(this).text());
						console.log('loader btn click')
						$(this)[0].click();
					}
				});
				$('#dashloader').hide();
			}
			catch (ex) {
				$.each($(".box"), function () {
					if ($(this).is(":hidden")) {
						// hiddenBoxes.push($(this).text());
						$(this)[0].click();
					}
				});
			}
		});
	}

	$('#reportrange').daterangepicker({
		startDate: start,
		endDate: end,
		ranges: {
			'Today': [moment(), moment()],
			'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
			'Last 7 Days': [moment().subtract(6, 'days'), moment()],
			'Last 30 Days': [moment().subtract(29, 'days'), moment()],
			'This Month': [moment().startOf('month'), moment().endOf('month')],
			'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
		}
	}, cb);
	// $(document).ready(function () {
	// do some html stuff here

	// cb(start, end);
	// });
	// cb(start, end);

	/* Time picker*/
	$('.input-timepicker').daterangepicker({
		timePicker: true,
		timePicker24Hour: true,
		timePickerIncrement: 1,
		timePickerSeconds: true,
		locale: {
			format: 'HH:mm:ss'
		}
	}).on('show.daterangepicker', function (ev, picker) {
		picker.container.find(".calendar-table").hide();
	});
	var edate = function () {
		return ({ "from": from.format('MMMM D, YYYY'), "to": to.format('MMMM D, YYYY') });
	}

});

function dashboard_data(storeId) {
	try {
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": `https://biz1pos.azurewebsites.net/api/Dashboard/Post/?fromDate=${from}&toDate=${to}&compId=${companyid}&storeId=${storeId}&i=1`,
			"method": "GET",
			"headers": {
				"Authorization": `Bearer ${localStorage.getItem('jwt_token')}`,
				"Content-Type": "application/json"
			},
			"processData": false,
		}
		$.each($(".box"), function () {
			if ($(this).is(":hidden")) {
				// hiddenBoxes.push($(this).text());
				console.log('loader btn click')
				$(this)[0].click();
			}
		});
		$('#dashloader').show();
		// console.log("two")
		$.ajax(settings).done(function (response) {
			$('#dashloader').hide();
			try {
				biz1ChartConfig(response);
				var nfObject = new Intl.NumberFormat('en-US');
				if (!response.hasOwnProperty('error')) {
					// $('#bills')[0].innerText = (response.TotalSales[0].TotalBills == null) ? 0 : nfObject.format(response.TotalSales[0].TotalBills);
					// $('#payments')[0].innerText = (response.TotalSales[0].TotalSales == null) ? 0 : nfObject.format(response.TotalSales[0].TotalSales);
					// $('#no_of_bills')[0].innerText = (response.TotalSales[0].NoOfBills == null) ? 0 : nfObject.format(response.TotalSales[0].NoOfBills);
					// $('#new_customers')[0].innerText = (response.NewCustomers[0].TotNewCustomers == null) ? 0 : nfObject.format(response.NewCustomers[0].TotNewCustomers);
				}
				var cardinnerhtml = `<div class="card-header card-header-action">
										<h6>StoreWise Sales</h6>
										<div class="d-flex align-items-center card-action-wrap">
											<a href="#" class="inline-block refresh mr-15">
												<i class="ion ion-md-arrow-down"></i>
											</a>
											<a href="#" class="inline-block full-screen mr-15">
												<i class="ion ion-md-expand"></i>
											</a>
											<a class="inline-block card-close" href="#" data-effect="fadeOut">
												<i class="ion ion-md-close"></i>
											</a>
										</div>
									</div>
									<div class="card-body pa-0">
										<div class="table-wrap">
											<div class="table-responsive">
												<table id="storewise-sales" class="table table-sm table-hover mb-0">
													<thead>
														<tr>
															<th>Store</th>
															<th>Bills</th>
															<th style="cursor: pointer;" onclick="sortTable()">Payments</th>
															<th>No. of Bils</th>
														</tr>
													</thead>
													<tbody>`;
				var TotalBills = 0;
				var TotalSales = 0;
				var NoOfBills = 0;
				if (response.hasOwnProperty('TotalSales')) {
					var TotalSalesArr = response.TotalSales.map(ts => {
						ts.Payments = response.StoreTransactions.filter(x => x.Id == ts.StoreId)[0] ? response.StoreTransactions.filter(x => x.Id == ts.StoreId)[0].Amount : 0
						return ts
					})
					TotalSalesArr = TotalSalesArr.sort((a, b) => (b.Payments - a.Payments))
					// console.log(response.TotalSales, TotalSalesArr)
					TotalSalesArr.forEach(element => {
						TotalBills = TotalBills + element.TotalBills;
						TotalSales = TotalSales + element.TotalSales;
						NoOfBills = NoOfBills + element.NoOfBills;
						cardinnerhtml = cardinnerhtml +
							`<tr>
								<td>${element.Name}</td>
								<td>&#8377;${nfObject.format(element.TotalBills)}</td>
								<td>&#8377;${nfObject.format(element.Payments)}</td>
								<td>${nfObject.format(element.NoOfBills)}</td>
							</tr>`
					});
					cardinnerhtml = cardinnerhtml + `</tbody>
												</table>
											</div>
										</div>
									</div>`
					$('#bills')[0].innerText = (TotalBills == null) ? 0 : nfObject.format(TotalBills);
					$('#payments')[0].innerText = (response.Payments[0].Payments == null) ? 0 : nfObject.format(response.Payments[0].Payments);
					$('#no_of_bills')[0].innerText = (NoOfBills == null) ? 0 : nfObject.format(NoOfBills);
					$('#new_customers')[0].innerText = (response.NewCustomers[0].TotNewCustomers == null) ? 0 : nfObject.format(response.NewCustomers[0].TotNewCustomers);
					if (storeId == 0 && response.TotalSales.length > 0) {
						$('#storewisecard')[0].innerHTML = cardinnerhtml;
					} else {
						$('#storewisecard')[0].innerHTML = '';
					}
				} else {
					$('#storewisecard')[0].innerHTML = '';
				}
				var innerhtml = `
				<div class="card-header card-header-action">
					<h6>Top Products</h6>
				</div>
				<div class="card-body pa-0">
					<div class="table-wrap">
						<div class="table-responsive">
							<table class="table table-sm table-hover mb-0">
								<thead>
									<tr>
										<th>Product</th>
										<th class="w-40">Sales</th>
										<th class="w-25">Qty</th>
										<th>FreeQty</th>
									</tr>
								</thead>
								<tbody>`;
				if (response.hasOwnProperty('Top5Sales')) {
					response.Top5Sales.forEach(element => {
						innerhtml = innerhtml + `<tr>
						<td>${element.Product}</td>
						<td>
							<div class="progress-wrap lb-side-left mnw-125p">
								<div class="progress-lb-wrap">
									<label
										class="progress-label mnw-50p">&#8377;${element.Price}</label>
								</div>
							</div>
						</td>
						<td>${element.Quantity}</td>
						<td>
							 ${element.ComplementryQty}
						</td>
					</tr>`
					});
					innerhtml = innerhtml + `</tbody>
										</table>
									</div>
								</div>
							</div>`;
					if (response.Top5Sales.length > 0) {
						$('#dash_top_prods')[0].innerHTML = innerhtml;
					} else {
						$('#dash_top_prods')[0].innerHTML = ``;
					}
				} else {
					$('#dash_top_prods')[0].innerHTML = ``;
				}
				$.each($(".box"), function () {
					if ($(this).is(":hidden")) {
						// hiddenBoxes.push($(this).text());
						console.log('loader btn click')
						$(this)[0].click();
					}
				});
			}
			catch (ex) {
				$.each($(".box"), function () {
					if ($(this).is(":hidden")) {
						// hiddenBoxes.push($(this).text());
						$(this)[0].click();
					}
				});
			}
		});
	} catch (err) {
		console.log(err)
	}
}