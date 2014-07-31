eurostatDb.js
=============

Retrieve and store data from eurostat's API.

Eurostat provides a wealth of information -- it's just pretty hard to get to and use. It provides the data over its API in a very 'rich' xml format that is a bit too overwhelming for many uses. This library aims at making things easier for use in javascript web applications.


Usage 
-----

Typically, there are 4 steps in interacting with eurostat data.

  1) Get list of 'data flows' (=tables) that are available.<br>
  2) Get 'data structure definition' for a certain data flow.<br>
  3) Initialise local table(s) to hold retrieved information.<br>
  4) Fill local table(s) and use the data.<br>
