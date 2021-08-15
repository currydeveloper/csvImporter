/**
 * Create the module.
 */

var ksModule = angular.module('csvimporter', []);

/**
 * Define any configs or statics
 */
//ksModule.config(function ($httpProvider) {
//    $httpProvider.defaults.xsrfCookieName = "CSRF-TOKEN";
//});



ksModule.controller('csvimporterController', ["$scope", "$q", "$http", function ($scope, $q, $http) {
	$scope.instructionsVisibility = false;
	$scope.instructionBtnLbl = "show file instructions";
	var CsrfToken = PluginHelper.getCsrfToken();
	$scope.processing = undefined;
	$scope.showInstructions = function () {
		$scope.instructionsVisibility = $scope.instructionsVisibility ? false : true;
		$scope.instructionBtnLbl = "hide file instructions";
	};

	$scope.downloadTemplate = function () {
		var a = document.createElement("a");
		var csv = "RoleName,Action\nRoleA,Enable\nRoleB,Disable"
		if (window.navigator.msSaveOrOpenBlob) {
			var blob = new Blob([decodeURIComponent(encodeURI(csv))], {
				type: "text/csv;charset=utf-8;"
			});
			navigator.msSaveBlob(blob, 'sample.csv');
		} else {

			a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(csv);
			a.target = '_blank';
			a.download = 'sample.csv';
			document.body.appendChild(a);
			a.click();
		}
	};
	var doRequest = function (method, fullPath, params, body) {
		var def = $q.defer();

		if (typeof params === 'undefined') {
			params = "";
		}

		if (typeof body === 'undefined') {
			body = "";
		}
		//$cookies.put("XSRF-TOKEN", $cookies.get("CSRF-TOKEN"));
		$http({
			method: method,
			url: fullPath,
			headers: {
				'X-XSRF-TOKEN': CsrfToken,
				'filter': params,
				'Content-type': "application/json"
			},
			data: body
		}).then(function (result) {
			var d;
			console.log(result, 'res');
			//if the data returned is a string, parse it into a JSON object to return.
			if (typeof result.data === 'string') {
				console.log("data is " + result.data);
				d = JSON.parse(result.data);
			} else {
				d = result.data;
			}
			console.log(d);

			//resolves the angular promise with the data (what is sent to the 'then' function)
			def.resolve(d);

		}, function (error) {
			def.reject("");
		});

		return def.promise;
	};
	$scope.submitForm = function (form) {
		var filename = document.getElementById("bulkDirectFile");
		if (filename.value.length < 1) {
			($scope.warning = "Please upload a file");
		} else {
			var file = filename.files[0];
			console.log(file)
			var fileSize = 0;
			$scope.processing = true;
			var fileContent = [];
			if (filename.files[0]) {
				var reader = new FileReader();
				reader.onload = function (e) {
					var rows = e.target.result.split("\r\n");
					var headers = [];
					for (var i = 0; i < rows.length; i++) {
						if (i == 0) {
							headers = rows[i].split(",");
							console.log(headers);
						} else {
							//Building a map of val and headers
							var cells = rows[i].split(",");
							var tempContent = {};
							for (var j = 0; j < cells.length; j++) {
								tempContent[headers[j]] = cells[j];
							}
							fileContent.push(tempContent);
							console.log(fileContent);
						}
					}
					console.log("final file:" + JSON.stringify(fileContent));
					// Calling the rest Api functionality.
					$scope.processedResults;
					var url = PluginHelper.getPluginRestUrl('csvimporter') + '/bulkBundleUpdate';
					console.log("url:" + url);
					doRequest('POST', url, '', fileContent).then(function (response) {
						$scope.processing = false;
						$scope.resultButton = true;
						$scope.processedResults = response;
						console.log("Results are:" + JSON.stringify($scope.processedResults));
						$scope.downloadResults = function () {
							var json = $scope.processedResults;
							var fields = Object.keys(json[0])
							var replacer = function (key, value) { return value === null ? '' : value }
							var csv = json.map(function (row) {
								return fields.map(function (fieldName) {
									return JSON.stringify(row[fieldName], replacer)
								}).join(',')
							})
							csv.unshift(fields.join(',')) // add header column
							csv = csv.join('\r\n');
							console.log(csv);
							// TODO : May be extract a function for later use.
							var a = document.createElement("a");
							if (window.navigator.msSaveOrOpenBlob) {
								var blob = new Blob([decodeURIComponent(encodeURI(csv))], {
									type: "text/csv;charset=utf-8;"
								});
								navigator.msSaveBlob(blob, 'Results.csv');
							} else {

								a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(csv);
								a.target = '_blank';
								a.download = 'Results.csv';
								document.body.appendChild(a);
								a.click();
							}
						}
					});

				}

				reader.readAsText(filename.files[0]);
			}
			return false;
		}
	};
}]

);
