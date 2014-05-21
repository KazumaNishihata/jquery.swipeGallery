jquery.swipeGallery
===================

jQuery swipte gallery

include this plugin after jQuery

`
<script src="jquery.js"></script>
<script src="jquery.swipeGallery.js"></script>
`

include this plugin CSS file

`
<link rel="stylesheet" href="jquery.swipeGallery.css">
`
execute `swipeGallery()`

`
$(window).load(function(){
	$("#swipeGallery01").swipeGallery();
});
`

options
-------------------


option | description | default
--- | --- | ---
viewport | viewport selector | .swipeGallery_viewport
inner | inner selector | .swipeGallery_inner
slide | slides selector | .swipeGallery_slide
paging | paging selectr | .swipeGallery_paging
paging_class | active paging class | current
next | next button selecor | false
prev | prev button selecor | false