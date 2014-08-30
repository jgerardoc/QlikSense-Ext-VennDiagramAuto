QlikSense-Ext-VennDiagramAuto
=============================

Venn Diagram Chart extension for QlikSense


This extension is built based on the Venn Diagram representation of sets and intersections.

At this moment it represents only two sets, but I intend to improve to represent three sets in the future.

It is full responsive, as it changes circle sizes and text font size every time the object is resized.



*********************************
Installation & Use
*********************************
To install, copy all files to folder "C:\Users\(your user name)\Documents\Qlik\Sense\Extensions\VennDiagramAuto".

To use, just drag the "Venn Diagram Auto" object from the object menu on the left in Edit mode.

Given the nature of the visualization, it uses two dimensions and one measures.

First Dimension: Indicates every element with data. This will be the granularity for the aggregations.
Second Dimension: Used to assign the two sets, based on two values of this dimension.

For example, if second dimension is year, you can choose two years for the two sets represented. The elemens in the second dimension has mesure values accross this two values, i.e. if Salesman is in the first dimension and years in the second dimension, the values will be Count (or Sum of sales) of Salesman accross this two years.


You can make selections clicking on any of the two sets.


Juan Gerardo
