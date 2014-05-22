/*!--------------------------------------------------------------------------*
 *  
 *  jquery.swipeGallery.js 1.0.0
 *  
 *  MIT-style license. 
 *  
 *  2014 Kazuma Nishihata 
 *  http://blog.webcreativepark.net/2014/05/21-155522.html
 *  
 *--------------------------------------------------------------------------*/

// ===============================================
//	CSS3アニメーション用プラグイン
//	http://blog.webcreativepark.net/2010/09/17-183446.html
// -----------------------------------------------
$.fn.animate3 = function(prop,speed,easing,callback){
	var self = this;
	if (jQuery.isEmptyObject(prop)) {
		return self;
	}
	if(speed && !isNaN(speed)){
		speed = speed+"ms";
	}
	var def = $.Deferred();

	callback = callback? callback:function(){};
	self
		.css("-webkit-transition","all "+speed+" "+easing)
		.unbind("webkitTransitionEnd")
		.one("webkitTransitionEnd",function(){
			self.css("-webkit-transition","");
			setTimeout(function(){
				def.resolveWith(self); 
			},1);
			callback.apply(self);
		}).css(prop);

	return def.promise(self);
}
// ===============================================
//	スライドショー用プラグイン
// -----------------------------------------------
$.fn.swipeGallery = function(op){

	op = $.extend({
		viewport : ".swipeGallery_viewport",
		inner : ".swipeGallery_inner",
		slide : ".swipeGallery_slide",
		paging : ".swipeGallery_paging",
		paging_class:"current",
		next:false,
		prev:false
	},op);

	return this.each(function(){
		var $this = $(this);
		({
			//initialize
			init : function(){
				var self = this;
				//get elemtents
				self.$viewport = $this.find(op.viewport );
				self.$inner    = $this.find(op.inner);
				self.$slide    = $this.find(op.slide);
				self.$paging   = $this.find(op.paging);
				self.$next     = $this.find(op.next);
				self.$prev     = $this.find(op.prev);

				//get slide length
				self.slideLength = self.$slide.length;
				if(self.slideLength==1){
					self.$next.remove()
					self.$prev.remove()
					return false;
				}else if(self.slideLength==2){
					self.$slide.each(function(){
						self.$inner.append($(this).clone());
					});
				}
				//set slide width
				self.setWidth();
				//set slide width
				self.setHeight();
				//set prev img
				self.setPrevImage();
				//set location
				self.$slide.find("a").attr({
					"data-href" : function(){
						return $(this).attr("href");
					},
					"draggable":"false",
					"href" : "javascript:void(0)"
				})
				//set draggable
				self.$slide.find("img").attr("draggable","false");
				self.setPaging();
				self.setEvent();
			},
			setPrevImage : function(){
				this.$slide.last().insertBefore(this.$slide.first());
				this.slideRefresh();
			},
			setWidth :function(){
				var self = this;
				var width = self.$viewport.innerWidth();
				//set slides width
				self.$inner.width(self.slideLength==2?width*self.slideLength*2:width*self.slideLength);
				//set slide width
				self.$slide.width(width);
				//default position
				self.defaultLeft = width;
				self.$inner.css("transform","translate3d(-"+self.defaultLeft+"px,0,0)")
			},
			setHeight: function () {
				var self   = this;
				var height = self.$inner.find('li').height();
				self.$inner.height(height);
			},
			setPaging : function(){
				var html="";
				for(var i = 0 ; i<this.slideLength ; i++){
					html += "<li>"+(i+1)+"</li>";
				}
				this.$paging.html(html);
				this.setPagingNumber();
			},
			page : 1,
			setPagingNumber : function(){
				this.$paging.children().removeClass(op.paging_class).eq(this.page-1).addClass(op.paging_class);
			},
			setEvent : function(){
				var self = this;

				//bind resize event
				$(window).resize($.proxy(self.resize,self));
				//bind touch event
				self.$inner
					.on("touchstart",$.proxy(self.touchstart,self))
					.on("touchmove",$.proxy(self.touchmove,self))
					.on("touchend",$.proxy(self.touchend,self));

				if(op.next){
					self.$next.click(function(){
						self.startX = 0;
						self.endX = 0;
						self.next();
						return false;
					});
				}

				if(op.prev){
					self.$prev.click(function(){
						self.startX = 0;
						self.endX = 0;
						self.prev();
						return false;
					});
				}
			},
			touchStartFlag : false,
			touchEndFlag : false,
			touchstart : function(e){
				if(this.touchStartFlag)return false;
				if(!e.pageX)e = event.touches[0];
				this.startX = e.pageX;
				this.startY = e.pageY;
				this.endX = this.startX;
				this.endY = this.startY;
				this.swipeFlag = false;
				this.scrollFlag = false;
				this.touchStartFlag = true;
				this.touchEndFlag = false;
				this.startScrollTop = $(window).scrollTop()-(window.outerHeight-window.innerHeight);

			},
			touchmove : function(e){
				if(!this.touchStartFlag || this.touchEndFlag)return false;
				if(!e.pageX)e = event.touches[0];
				this.endX = e.pageX;
				this.endY = e.pageY;
				if(!this.swipeFlag && !this.scrollFlag){
					if(Math.abs(this.startX-this.endX)<Math.abs(this.startY-this.endY)){
						this.scrollFlag = true;
					}else{
						event.preventDefault();
						this.swipeFlag = true;
					}
				}
				if(this.swipeFlag){
					this.$inner.css("transform","translate3d(-"+(this.defaultLeft+(this.startX-this.endX))+"px,0,0)");
				}
			},
			touchend : function(e){
				if(!this.touchStartFlag || this.touchEndFlag)return false;
				this.touchEndFlag = true
				var self = this;
				if(self.scrollFlag){
					self.flagRefresh();
				}else if(self.swipeFlag && self.startX-self.endX>20){
					self.next();
				}else if(self.swipeFlag && self.startX-self.endX<-20){
					self.prev();
				}else{
					setTimeout(function(){
						self.endScrollTop = $(window).scrollTop()-(window.outerHeight-window.innerHeight);
						if(Math.abs(self.startScrollTop-self.endScrollTop) < 20 && Math.abs(self.startY-self.endY) < 20 ){
							if($(e.target).closest("a").length>0){
								self.flagRefresh();
								location.href = $(e.target).closest("a").data("href");
							}else if($(e.target).filter("a").length>0){
								self.flagRefresh();
								location.href = $(e.target).filter("a").data("href");
							}else{
								self.defaults();
							}
						}else{
							self.defaults();
						}
					},10);
				}
			},
			next : function(){
				if(this.animateFlag)return false;
				this.animateFlag = true;
				var self = this;
				self.page++;
				if(self.page>self.slideLength)self.page=1;
				self.setPagingNumber();

				$this.find(op.inner).animate3({
					"transform":"translate3d(-"+(this.defaultLeft*2)+"px,0,0)"
				},400,"linear",function(){
					setTimeout(function(){
						self.$slide.first().insertAfter(self.$slide.last());
						self.slideRefresh();
						self.$inner.css("transform","translate3d(-"+self.defaultLeft+"px,0,0)");
						self.flagRefresh();
					},100);
				});
			},
			prev : function(){
				if(this.animateFlag)return false;
				this.animateFlag = true;
				var self = this;
				self.page--;
				if(self.page==0)self.page=self.slideLength;
				self.setPagingNumber();

				$this.find(op.inner).animate3({
					"transform":"translate3d(0,0,0)"
				},400,"linear",function(){
					setTimeout(function(){
						self.$slide.last().insertBefore(self.$slide.first());
						self.slideRefresh();
						self.$inner.css("transform","translate3d(-"+self.defaultLeft+"px,0,0)");
						self.flagRefresh();
					},100);
				});
			},
			defaults : function(){
				var self = this;
				self.$inner.animate3({
					"transform":"translate3d(-"+self.defaultLeft+"px,0,1px)"
				},100,"ease",function(){
					self.$inner.css("transform","translate3d(-"+self.defaultLeft+"px,0,0)");
					self.flagRefresh();
				});
			},
			slideRefresh : function(){
				this.$slide = $this.find(op.slide);
			},
			flagRefresh : function(){
				this.swipeFlag = false;
				this.scrollFlag = false;
				this.touchStartFlag = false;
				this.touchEndFlag = false;
				this.animateFlag = false;
			},
			resize :function(){
				if(!this.swipeFlag){
					this.setWidth();
					this.setheight();
				}
			}
		}).init();
	});
}
