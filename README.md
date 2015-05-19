#HersheyReturns

![screenshot](/screenshot.png?raw=true)

HersheyReturns uses the Hershey fonts dataset to display text with svg characters.
The conversion method is similar to the one used here : https://github.com/techninja/hersheytextjs and here : http://www.evilmadscientist.com/2011/hershey-text-an-inkscape-extension-for-engraving-fonts/ but this project is more focused on applying hershey fonts to existing html elements with precise and customizable scaling and letters/words/lines spacing. The goal is to make a usable and evolvable library for an entire website or application. The first and current version is written for the website http://davidwidart.be. It works with Jquery, Raphael.js + svg Hershey fonts (initially uploaded here : http://www.thingiverse.com/thing:6168).

Main features are : 
- uses color, font-size, line-height, letter-spacing, text-align css standard attributes
- independent scale width and scale height with no stroke deformation
- adapts on window resize
- automatic word wrapping without any character cut off


