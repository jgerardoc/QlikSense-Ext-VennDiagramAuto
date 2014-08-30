define(["jquery", "text!./VennDiagramAuto.css", "./VennDiagramAutoHelper"], function($, cssContent) {'use strict';
	$("<style>").html(cssContent).appendTo("head");
	return {
		initialProperties : {
			version: 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qTop: 0,
					qLeft: 0,
					qHeight: 1000,
					qWidth: 3
				}],
			},
			ValueSetA: "10",
			ValueSetB: "10",
			Aggregation: "Sum",
			NumDecimals: 0, 
			Thousands: true, 
			DecimalSep: ",", 
			ThousandSep: "."
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 2,
					max : 2
				},
				measures : {
					uses : "measures",
					min : 1,
					max : 1
				},
				sorting : {
					uses : "sorting"
				},
				settings: {
					uses: "settings",
					items: {
						Venn: {
							type: "items",
							label: "Venn Diagram",
							items: {
								ValueSetA:{
									ref: "ValueSetA",
									expression:"optional",
									translation: "Value for set A",
									type: "string",
									defaultValue: "A"
								},
								ValueSetB:{
									ref: "ValueSetB",
									expression:"optional",
									translation: "Value for set B",
									type: "string",
									defaultValue: "B"
								},
								Aggregation:{
									ref: "Aggregation",
									expression:"optional",
									translation: "Aggregation of values to show",
									type: "string",
									component: "radiobuttons",
									options: [ {
										value: "Sum",
										label: "Sum"
									}, {
										value: "Count",
										label: "Count"
									} ],
									defaultValue: "Sum"
								},
								NumDecimals:{
									ref: "NumDecimals",
									translation: "Number of decimals to show",
									type: "number",
									defaultValue: 0
								},
								Thousands:{
									ref: "Thousands",
									translation: "Use a Thousands separator",
									type: "boolean",
									defaultValue: true
								},
								DecimalSep:{
									ref: "DecimalSep",
									translation: "Decimals separator",
									type: "string",
									defaultValue: ","
								},
								ThousandSep:{
									ref: "ThousandSep",
									translation: "Thousands separator",
									type: "string",
									defaultValue: "."
								}
							}
						}
					}
				}
			}
		},
		snapshot : {
			canTakeSnapshot : true
		},
		paint : function($element, layout) {
			var html = "";
			var self = this, lastrow = 0;

			var TotalSumA = 0, TotalSumB = 0, TotalSumAB = 0, TotalCountA = 0, TotalCountB = 0, TotalCountAB = 0;
			var curItem, curSumA = 0, curSumB = 0, curSumAB = 0, curCountA = 0, curCountB = 0, curCountAB = 0;
			
			function AssignNewItem() {
				if(curCountA > 0 && curCountB > 0){
				//Debug html += "<tr><td>AB</td></tr>";
					// A * B, this item has value in the two sets
					curCountAB = 1;
					curCountA = 0; curCountB = 0;
					
					curSumAB = curSumA + curSumB;
					curSumA = 0; curSumB = 0;
				}
				
				TotalSumA += curSumA; TotalSumB += curSumB; TotalSumAB += curSumAB;
				TotalCountA += curCountA; TotalCountB += curCountB; TotalCountAB += curCountAB;
				
				curSumA = 0; curSumB = 0; curSumAB = 0; curCountA = 0; curCountB = 0; curCountAB = 0;
			}

			//Debug html = "<table>"
			//render data
			this.backendApi.eachDataRow(function(rownum, row) {
				lastrow = rownum;

				var Item = row[0].qText, Set = row[1].qText, Val = row[2].qNum;
				
				function AssignRepeatedItem() {
					// Defined here because it uses Set and Val variables.
					if(Set == layout.ValueSetA){
						//Debug html += "<tr><td>A</td></tr>";
						curCountA = 1;
						curSumA += Val;
					}
					if(Set == layout.ValueSetB){
						//Debug html += "<tr><td>B</td></tr>";
						curCountB = 1;
						curSumB += Val;
					}
				}
				
				if(Item == curItem){
					// Repeated
					AssignRepeatedItem();
				} else {
					// New Item
					AssignNewItem();
					
					//Debug html += "<tr><td>Total for " + curItem + "</td><td>" + TotalCountA.toString() + "</td><td>" + TotalCountB.toString() + "</td><td>" + TotalCountAB.toString() + "</td></tr>";
					
					curItem = Item;
					// Assign the new value
					AssignRepeatedItem();
				}
			
				//Debug html += "<tr><td>" + Item + "</td><td>" + curCountA.toString() + "</td><td>" + curCountB.toString() + "</td><td>" + curCountAB.toString() + "</td></tr>";
			});
 			if (curCountA > 0 || curCountB > 0) {
				// There is a pending item
				AssignNewItem();
			}
			//Debug html += "</table>";
			//Debug html += "<table><tr><td>Grand Total</td><td>" + TotalCountA.toString() + "</td><td>" + TotalCountB.toString() + "</td><td>" + TotalCountAB.toString() + "</td></tr></table>";
			
			if(layout.Aggregation == "Sum"){
				var TextA = (TotalSumA == 0) ? "":formatNumber(TotalSumA, layout.NumDecimals, layout.Thousands, layout.DecimalSep, layout.ThousandSep);
				var TextB = (TotalSumB == 0) ? "":formatNumber(TotalSumB, layout.NumDecimals, layout.Thousands, layout.DecimalSep, layout.ThousandSep);
				var TextAB = (TotalSumAB == 0) ? "":formatNumber(TotalSumAB, layout.NumDecimals, layout.Thousands, layout.DecimalSep, layout.ThousandSep);
			} else {
				var TextA = (TotalCountA == 0) ? "":formatNumber(TotalCountA, layout.NumDecimals, layout.Thousands, layout.DecimalSep, layout.ThousandSep);
				var TextB = (TotalCountB == 0) ? "":formatNumber(TotalCountB, layout.NumDecimals, layout.Thousands, layout.DecimalSep, layout.ThousandSep);
				var TextAB = (TotalCountAB == 0) ? "":formatNumber(TotalCountAB, layout.NumDecimals, layout.Thousands, layout.DecimalSep, layout.ThousandSep);
			}
			

			var MaxSize = Math.min($element.width(), $element.height());
			var Diameter = MaxSize * 0.65;
			var Offset = MaxSize * 0.35;
			
			// A text coordinates
			var FontSizeOnlyA = Math.floor((MaxSize * 0.5) / TextA.length);
			var xTextOnlyA = MaxSize * 0.05 + (MaxSize * 0.5 - TextA.length * FontSizeOnlyA) / 2;
			var yTextOnlyA = MaxSize * 0.2;

			// B text coordinates
			var FontSizeOnlyB = Math.floor((MaxSize * 0.5) / TextB.length);
			var xTextOnlyB = MaxSize * 0.65 + (MaxSize * 0.5 - TextB.length * FontSizeOnlyB) / 2;
			var yTextOnlyB = MaxSize * 0.2;
			
			// A * B text coordinates
			var FontSizeAandB = Math.floor((MaxSize * 0.4) / TextAB.length);
			var xTextAandB = Offset + (MaxSize * 0.5 - TextAB.length * FontSizeAandB) / 2;
			var yTextAandB = MaxSize * 0.3;
			
			var StartTable = Diameter + 20;
			

			html += "<div class='OnlyA' title='" + layout.ValueSetA + ": " + TextA + "' style = 'position:absolute;left:0px;top:0px;width:" + Diameter.toString() + "px; height:" + Diameter.toString() + "px;'></div>";
			html += "<div class='OnlyB' title='" + layout.ValueSetB + ": " + TextB + "' style = 'position:absolute;left:" + Offset.toString() + "px;top:0px;width:" + Diameter.toString() + "px; height:" + Diameter.toString() + "px;'></div>";
 			html += "<div class='TextA'  style = 'position:absolute;left:" + xTextOnlyA.toString() + "px; top:" + yTextOnlyA.toString() + "px;font-size:" + FontSizeOnlyA.toString() + "px;'>" + TextA + "</div>";
			html += "<div class='TextB'  style = 'position:absolute;left:" + xTextOnlyB.toString() + "px; top:" + yTextOnlyB.toString() + "px;font-size:" + FontSizeOnlyB.toString() + "px;'>" + TextB + "</div>";
			html += "<div class='TextAB' style = 'position:absolute;left:" + xTextAandB.toString() + "px; top:" + yTextAandB.toString() + "px;font-size:" + FontSizeAandB.toString() + "px;'>" + TextAB + "</div>";

 			// The Ledgend table
			html += "<table style='position:absolute; top:" + StartTable.toString() + "px'>";
			html += "<tr>";
			html += "<td class='LedgendA'>&nbsp</td><td style='text-align:left'>" + layout.ValueSetA + "</td>";
			html += "<td class='LedgendB'>&nbsp</td><td style='text-align:left'>" + layout.ValueSetB + "</td>";
			html += "</tr>";
			//html += "<tr colspan='4' style='text-align: right'>" + FontSizeAandB.toString() + "</tr>";
			//html += "<tr colspan='4' style='text-align: right'>H: " + $element.height().toString() + " - W: " + $element.width().toString() + " - MaxSize: " + MaxSize.toString() + "</tr>";
			html += "</table>";


			$element.html(html);
			
/* 			// get more data from the engine
			var requestPage = [{
					qTop : lastrow + 1,
					qLeft : 0,
					qWidth : 3, 
					qHeight : Math.min(50, this.backendApi.getRowCount() - lastrow)
				}];

			this.backendApi.getData(requestPage).then(function(dataPages) {
				self.paint($element);
			});	
 */
		}
	};
});
