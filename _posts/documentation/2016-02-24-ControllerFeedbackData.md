---
layout: feature-doc
title:  "Controller feedback data"
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000

categories   : include
---
The Navgroup is a flexible, powerful component for navigation around big screen experiance. You can quickly build simply to complex navigation structure to your application, allowing your users move around freely using keyboard events.
<!--more-->

## Information returned back to controller Hooks.

| No. | Return keys           | Return values                                   | Pullbar    | Analog pad | DPad     | GesturePad |
|---- | --------------------  | ----------------------------------              | :-:        | :-:        | :-:      | :-:        |
| 01. | compass_rose          | The direction the user is moving the controller | &#x2714; | &#x2714;   | &#x2714; | &#x2714;   |
| 02. | cartesian_coordinate  | Cartesian coordinates of x and y                | &#x2714; | &#x2714;   |          | &#x2714;   |
| 03. | axis_direction        | in, out, static                                 | &#x2714; | &#x2718;   |          | &#x2718;   |
| 04. | direction             | UP, RIGHT, DOWN, LEFT                           | &#x2714; | &#x2714;   | &#x2714; | &#x2714;   |
| 06. | angle                 | in, out, static                                 | &#x2714; | &#x2718;   | &#x2718; | &#x2718;   |
| 05. | delta                 | Cartesian coordinates of x and y                | &#x2714; | &#x2714;   |          | &#x2714;   |

## 01. Compass rose
compass_rose is the movment given as

![alt text]( /images/a-pad-cardinal-direction@2x.png "Logo Title Text 1")
![alt text]( /images/a-pad-cardinal-direction@2x.png "Logo Title Text 1")
![alt text]( /images/a-pad-cardinal-direction@2x.png "Logo Title Text 1")

| No. | Movment type    | Compass rose |
|---- | -------------   | ------------ |
| 01. | Move up         | N            |
| 02. | Move up right   | NE           |
| 03. | Move right      | E            |
| 04. | Move down right | SE           |
| 05. | Move down       | S            |
| 06. | Move down left  | SW           |
| 07. | Move left       | W            |
| 08. | Move up left    | NW           |

## 02. Cartesian coordinate
Table below otulines Cartesian coordinate that will be return by a support controler.

![alt text]( /images/a-pad-coordinates-diagram@2x.png "Logo Title Text 1")
![alt text]( /images/a-pad-coordinates-diagram@2x.png "Logo Title Text 1")
![alt text]( /images/a-pad-coordinates-diagram@2x.png "Logo Title Text 1")

| No. | Movment type  | Cartesian coordinate               |
|---- | ------------- | ---------------------------------- |
| 01. | Move up       | Values 0 to -1.0 on y axis.        |
| 02. | Move down     | Values 0 to 1.0 on y axis.         |
| 03. | Move left     | Values 0 to -1.0 on x axis.        |
| 04. | Move right    | Values 0 to 1.0 on x axis.         |



## 03. Axis direction
Table below otulines the axis direction that will be return by a support controler.

| No. | Movment type  | Cartesian coordinate                                            |
|---- | ------------- | ----------------------------------                              |
| 01. | In            | User is moving in towards the centre of the {{ page.title }}.   |
| 02. | Out           | User is moving in away from the centre of the {{ page.title }}. |
| 03. | Static        | Moving in the same direction.                                   |



## 04. Direction
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —



## 05. Delta (Hammer.js)
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —



## 06. Angle (Hammer.js)
![alt text]( /images/a-pad-angle-diagram@2x.png "Logo Title Text 1")
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —