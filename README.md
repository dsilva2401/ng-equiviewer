# Equirectangular viewer in Angular JS

## Basic usage

```html
<eq-viewer img="eqrectangularImage">
	<eq-marker alpha="15" beta="-10"></eq-marker>
	<eq-marker alpha="90" beta="0"></eq-marker>
	<eq-marker alpha="270" beta="10"></eq-marker>
	..
</eq-viewer>
```

## `eq-viewer` directive

Render equirectangular view

#### Attributes

Attribute | Description
----------|-------------
img | *Equirectangular image*
alpha | *Horizontal direction of the camera*
beta | *Vertical direction of the camera*
zoom | *Zoom of the camera (default 70)*
min-alpha | *Min value of alpha (default 0)*
max-alpha | *Max value of alpha (default 360)*
min-beta | *Min value of beta (default -90)*
max-beta | *Max value of beta (default 90)*

## `eq-marker` directive

Targets of equirectangular view

#### Attributes

Attribute | Description
----------|-------------
alpha | *Horizontal position of the target*
beta | *Vertical position of the target*
distance | *Distance between target and the camera*
