/**
 * XSlide
 * Author: ABTanjir
 * OMICRONIC.COM
 * @version 1.0
 * @update 2019/04/08
 */
class XSlider {

	constructor(opts) {

		let that = this;
		this.opts = $.extend(true, {
			el: '',
			min: 1,
			max: 1,
			value: 1,
			step: 1,
			className: '',
			direction: 'horizontal',
			handleAutoSize: true,
			handleMinSize: 15,	
			clickToChange: true,
			isActive: true,	
			tooltip: true,			
			tooltipOffset: 3,		
			tooltipDirection: '',		
			tooltipFormat(value){
				return value.toFixed(that.precision) + '/' + that.opts.max.toFixed(that.precision);
			},

			autoScroll: true,			
			autoScrollDelayTime: 250,	

			initRunOnChange: true,		
			isStopEvent: false,         
			onDragChange(val, oldVal){},
			onChange(val, oldVal) {},   

		}, opts);

		if(this.opts.tooltipDirection === ''){
			this.opts.tooltipDirection = this.opts.direction === 'horizontal' ? 'top': 'right'
		}
		
		this.events = {
			start: 'touchstart mousedown',
			move: 'touchmove mousemove',
			end: 'touchend mouseup',
			over: 'mouseenter',
			out: 'mouseleave'
		};

		this.stepNums = 0;//åˆ»åº¦æ•°é‡
		this.precision = 0;//ç´ å€¼ç²¾åº¦
		this.isDrag = false;

		this.$bg = undefined;
		this.$handleWrapper = undefined;
		this.$handle = undefined;
		this.$body = $('body');
		this.$window = $(window);

		this._initElement();
		this._initEvent();
		this.setOptions(this.opts);

		//ä¸ºäº†åœ¨åˆå§‹åŒ–å€¼æ—¶ï¼Œä¸è¦åŠ¨ç”»æ•ˆæžœ
		setTimeout(()=>{
			this.$handle.attr('isdrag', 'false');
		}, 100);

	}

	_initElement() {

		this.$el = $(this.opts.el);

		this.$wrapper = $(`
			<div class="xslide">
				<div class="xslide-bg"></div>
				<div class="xslide-handle-wrapper">
					<div class="xslide-handle" isdrag="none"></div>
				</div>
			</div>
		`);

		this.$bg = this.$wrapper.find('.xslide-bg');
		this.$handleWrapper = this.$wrapper.find('.xslide-handle-wrapper');
		this.$handle = this.$wrapper.find('.xslide-handle');

		this.$el.append(this.$wrapper);
		this.$body.append(this.$tooltip);

	}

	_initEvent() {

		let that = this;

		this.$window.on('resize', function(){
			that.resize();
		});

		//handle æ»‘å—æ‹–æ‹½
		this.$handle.on(this.events.start, function(evt){

			evt.preventDefault();

			if(!that.opts.isActive){
				return false;
			}

			let $this = $(this);
			let dragEvent = evt.touches ? evt.touches[0] : evt;
			let handleOffset = $this.offset();

			if(that.opts.min === that.opts.max){
				return;
			}

			//åç§»æ•°æ®
			let positionStart = {
				left: dragEvent.pageX - handleOffset.left,
				top: dragEvent.pageY - handleOffset.top
			};

			//è®¾ç½®å½“å‰ä½æ‹–æ‹½ä¸­æ ‡è®°
			$this.attr('isdrag', 'true');
			that.isDrag = true;

			function drawMove(evt){

				let dragEvent = evt.touches ? evt.touches[0] : evt;
				let position = {
					left: dragEvent.pageX - positionStart.left - that.$handleWrapper.offset().left,
					top: dragEvent.pageY - positionStart.top - that.$handleWrapper.offset().top
				};

				//åæ ‡è¶Šç•Œå¤„ç†
				if(position.left < 0){
					position.left = 0;
				}else if(position.left + $this.width() > that.$handleWrapper.width()){
					position.left = that.$handleWrapper.width() - $this.width();
				}

				if(position.top < 0){
					position.top = 0;
				}else if(position.top + $this.height() > that.$handleWrapper.height()){
					position.top = that.$handleWrapper.height() - $this.height();
				}

                if(that.opts.direction === 'horizontal'){
					$this.css('left', position.left);
				}else{
					$this.css('top', position.top);
				}

				that.setValue(that._getHandlePositionValue(position.left, position.top), false);

				//tooltip
				if(that.opts.tooltip){
					let tooltipPosition = that._getTooltipPositionForHandle();
					that._tooltip(true, tooltipPosition.left, tooltipPosition.top, that.opts.tooltipFormat(that.opts.value));
				}

			}

			function drawEnd(evt){

				$this.attr('isdrag', 'false');
				that.isDrag = false;
				that.$window.off(that.events.move, drawMove);
				that.$window.off(that.events.end, drawEnd);

				if(that.opts.tooltip) {
					if (evt.touches || !$(evt.target).closest(that.$wrapper).length) {
						that._tooltip(false);
					}
				}

				if(that.opts.autoScroll){
					if(evt.touches || !$(evt.target).closest(that.$wrapper).length){
						that._handleScrollToValuePosition();
					}
				}

			}

			that.$window.on(that.events.move, drawMove);
			that.$window.on(that.events.end, drawEnd);
			if(that.opts.isStopEvent){
				evt.preventDefault();
				evt.stopPropagation();
			}

		});

		this.$handleWrapper
			.on(this.events.start, function (evt) {

				if(!that.opts.isActive){
					return false;
				}

				let dragEvent = evt.touches ? evt.touches[0] : evt;
				let handleWrapperOffset = that.$handleWrapper.offset();
				let handlePosition = that.$handle.position();
				
				let position = {
					left: dragEvent.pageX - handleWrapperOffset.left,
					top: dragEvent.pageY - handleWrapperOffset.top,
					handleLeft: dragEvent.pageX - handleWrapperOffset.left - that.$handle.width()/2,
					handleTop: dragEvent.pageY - handleWrapperOffset.top - that.$handle.height()/2,
				};

				if (that.opts.direction === 'horizontal') {
					if(position.left > handlePosition.left && position.left < handlePosition.left + that.$handle.width()){
						return;
					}
				} else {
					if(position.top > handlePosition.top && position.top < handlePosition.top + that.$handle.height()){
						return;
					}
				}

				if(position.handleLeft < 0){
					position.handleLeft = 0;
				}else if(position.handleLeft + that.$handle.width() > that.$handleWrapper.width()){
					position.handleLeft = that.$handleWrapper.width() - that.$handle.width();
				}

				if(position.handleTop < 0){
					position.handleTop = 0;
				}else if(position.handleTop + that.$handle.height() > that.$handleWrapper.height()){
					position.handleTop = that.$handleWrapper.height() - that.$handle.height();
				}

				let pointValue = that._getHandleWrapperPointValue(position.left, position.top);

				that.setValue(pointValue, false);

				if (that.opts.direction === 'horizontal') {
					that.$handle.css('left', position.handleLeft);
				} else {
					that.$handle.css('top', position.handleTop);
				}

			})
			.on(this.events.over, function (evt) {
				clearTimeout(that._timer);
			})
			.on(this.events.out, function(evt){

				if(that.opts.autoScroll){
					if(evt.touches || !that.isDrag){
						that._handleScrollToValuePosition();
					}
				}

			});


		//tooltip(PCç«¯ä¸“å±žäº‹ä»¶)
		this.opts.tooltip && this.$handleWrapper
			.on('mousemove', function (evt) {

				let handlePosition = that.$handle.offset();

				let evtPosition = {
					left: evt.pageX - that.$handleWrapper.offset().left,
					top: evt.pageY - that.$handleWrapper.offset().top
				};

				if(that.opts.direction === 'horizontal'){


					if(evt.pageX >= handlePosition.left && evt.pageX <= handlePosition.left + that.$handle.width()){

						if(!that.isDrag){
							let tooltipPosition = that._getTooltipPositionForHandle();
							that._tooltip(true, tooltipPosition.left, tooltipPosition.top, that.opts.tooltipFormat(that.opts.value));
						}

					}else{

						let tooltipPosition = that._getTooltipPositionForHandleWrapper(evt.pageX, evt.pageY);
						let pointValue = that._getHandleWrapperPointValue(evtPosition.left, evtPosition.top);
						that._tooltip(true, tooltipPosition.left, tooltipPosition.top, that.opts.tooltipFormat(pointValue));
					}

				}else{

					if(evt.pageY >= handlePosition.top && evt.pageY <= handlePosition.top + that.$handle.height()){

						if(!that.isDrag){
							let tooltipPosition = that._getTooltipPositionForHandle();
							that._tooltip(true, tooltipPosition.left, tooltipPosition.top, that.opts.tooltipFormat(that.opts.value));
						}

					}else{

						let tooltipPosition = that._getTooltipPositionForHandleWrapper(evt.pageX, evt.pageY);
						let pointValue = that._getHandleWrapperPointValue(evtPosition.left, evtPosition.top);
						that._tooltip(true, tooltipPosition.left, tooltipPosition.top, that.opts.tooltipFormat(pointValue));
					}

				}

			})
			.on('mouseleave', function (evt) {
				if(!that.isDrag ){//&& evt.relatedTarget !== that.$tooltip[0]
					that._tooltip(false);
				}
			});

	}

	setOptions(opts){
		
		this.opts = $.extend(true, this.opts, opts);
		
		opts.direction && this.$wrapper.removeClass('horizontal vertical').addClass(opts.direction);

		opts.className && this.$wrapper.removeClass(this.opts.className).addClass(opts.className);

		if(this.opts.handleAutoSize){
			this._resetHandleSize();
		}else{
			this.opts.min == this.opts.max ? this.$handle.css('visibility','hidden') : this.$handle.css('visibility','');
		}

		this.stepNums = (this.opts.max - this.opts.min) / this.opts.step; 

		
		if(opts.value !== undefined){
			this.setValue(opts.value);
		}

		if(opts.min !== undefined || opts.max !== undefined || opts.step !== undefined){

			let precision = this.precision;

			if(opts.min !== undefined){
				let tmp = this.opts.min.toString().split('.');
				let _precision = tmp[1] ? tmp[1].length : 0;
				if(_precision> precision){
					precision = _precision;
				}
			}

			if(opts.max !== undefined){
				let tmp = this.opts.max.toString().split('.');
				let _precision = tmp[1] ? tmp[1].length : 0;
				if(_precision> precision){
					precision = _precision;
				}
			}

			if(opts.step !== undefined){
				let tmp = this.opts.step.toString().split('.');
				let _precision = tmp[1] ? tmp[1].length : 0;
				if(_precision> precision){
					precision = _precision;
				}
			}

			this.precision  = precision;

		}

	}

	setValue(value, toScroll = true){
		if(value < this.opts.min || value > this.opts.max){
			return;
		}

		if(value !== this.opts.value){
			this.opts.onChange(value, this.opts.value);
		}

		this.opts.value = value;
		!this.isDrag && toScroll && this._setHandlePositionByValue(value);

	}

	getValue(){
		return this.opts.value;
	}

	resize(){
		this._resetHandleSize();
		this._setHandlePositionByValue(this.opts.value);
	}
	deactive(){
		this.$handle.css({'transition': 'none'});
		this.opts.isActive = false;

	}
	active(){

		this.$handle.css({'transition': 'transform $xslide-animate-speed linear, all $xslide-animate-speed linear;'});
		this.opts.isActive = true;

	}
	/**
	 * @DateTime    2018/12/20 9:30
	 * @Author      wangbing
	*/
	_resetHandleSize(){

		let handleSize;

		if(this.opts.handleAutoSize){

			this.$handle.one('webkitTransitionEnd transitionend', evt => {
			    this._setHandlePositionByValue(this.opts.value);
			});

			if(this.opts.direction === 'horizontal'){
				handleSize = this.$wrapper.width() / ((this.opts.max - this.opts.min) / this.opts.step + 1);
			}else{
				handleSize = this.$wrapper.height() / ((this.opts.max - this.opts.min) / this.opts.step + 1);
			}

			if(handleSize < this.opts.handleMinSize){
				handleSize = this.opts.handleMinSize;
			}

			this.opts.direction == 'horizontal' ? this.$handle.width(handleSize) : this.$handle.height(handleSize);

		}else{

			this.opts.direction == 'horizontal' ? this.$handle.width() : this.$handle.height();

		}

	}

	_value(value){
		return Number(value.toFixed(this.precision));
	}
	
	/**
	 * æ˜¾ç¤ºtooltip
	 * @DateTime    2018/12/26 15:23
	 * @Author      wangbing
	 * @param       {Boolean}   isShow
	 * @param		{Number}	left
	 * @param		{Number}	top
	 * @param		{String}	text
	*/
	_tooltip(isShow, pageX = 0, pageY = 0, text = ""){
		if(isShow){

			if(!this.$tooltip){
				this.$tooltip = $('<div class="xslide-tooltip '+this.opts.tooltipDirection+'">' + text + '</div>');
				this.$body.append(this.$tooltip);
			}

			this.$tooltip.html(text).css({left: pageX, top: pageY}).show();

		}else{

			if(this.$tooltip){
				this.$tooltip.hide();
			}

		}
	}

	/**
	 * @DateTime    2018/12/20 15:59
	 * @Author      wangbing
	 * @param       {Number}    positionLeft 
	 * @param       {Number}    positionTop
	 * @return      {Number}
	 */
	_getHandlePositionValue(positionLeft, positionTop){

		let value;
		let stepPix; //æ¯ä¸€ä¸ªåˆ»åº¦çš„åƒç´ å°ºå¯¸

		if (this.opts.direction === 'horizontal') {
			stepPix = (this.$handleWrapper.width() - this.$handle.width()) / this.stepNums;
			value = parseInt((positionLeft + stepPix/2) / stepPix) * this.opts.step + parseFloat(this.opts.min);
		} else {
			stepPix = (this.$handleWrapper.height() - this.$handle.height()) / this.stepNums;
			value = parseInt((positionTop + stepPix/2) / stepPix) * this.opts.step + parseFloat(this.opts.min);
		}

		return this._value(value);

	}

	/**
	 * @DateTime    2018/12/21 13:48
	 * @Author      wangbing
	 * @param       {Number}    positionLeft  æ°´å¹³ç›¸å¯¹åæ ‡
	 * @param       {Number}    positionTop  åž‚ç›´ç›¸å¯¹åæ ‡
	 * @return      {Number}    å®žé™…å€¼
	 */
	_getHandleWrapperPointValue(positionLeft, positionTop){

		let value;
		let stepPix; 

		if (this.opts.direction === 'horizontal') {
			
			if(this.stepNums){
				stepPix = this.$handleWrapper.width() / this.stepNums;
				value = parseInt((positionLeft + stepPix/2) / stepPix) * this.opts.step + parseFloat(this.opts.min);
			}else{
				value = this.opts.min;
			}

		} else {

			if(this.stepNums){
				stepPix = this.$handleWrapper.height() / this.stepNums;
				value = parseInt((positionTop + stepPix/2) / stepPix) * this.opts.step + parseFloat(this.opts.min);
			}else{
				value = this.opts.min;
			}

		}

		return this._value(value);

	}

	/**
	 * @DateTime    2018/12/21 14:13
	 * @Author      wangbing
	 * @param       {Number}    value	å®žé™…å€¼
	 */
	_setHandlePositionByValue(value){

		// if(!this.stepNums){
		// 	return;
		// }
		let stepPix; //æ¯ä¸€ä¸ªåˆ»åº¦çš„åƒç´ å°ºå¯¸
		
		if (this.opts.direction === 'horizontal') {
			
			if(this.stepNums){
				stepPix = (this.$handleWrapper.width() - this.$handle.width()) / this.stepNums;
				this.$handle.css('left', ((value - this.opts.min) / this.opts.step) * stepPix);
			}else{
				this.$handle.css('left', 0);
			}


		} else {

			if(this.stepNums){
				stepPix = (this.$handleWrapper.height() - this.$handle.height()) / this.stepNums;
				this.$handle.css('top', ((value - this.opts.min) / this.opts.step) * stepPix);
			}else{
				this.$handle.css('top', 0);
			}

		}

	}

	_getTooltipPositionForHandle(){

		let position;

		let handleOffset = this.$handle.offset();

		switch (this.opts.tooltipDirection) {
			case 'top':
				position = {
					left: handleOffset.left + this.$handle.width() / 2,
					top: handleOffset.top - this.opts.tooltipOffset
				};
				break;

			case 'bottom':
				position = {
					left: handleOffset.left + this.$handle.width() / 2,
					top: handleOffset.top + this.$handle.height() + this.opts.tooltipOffset
				};
				break;
			case 'left':
				position = {
					left: handleOffset.left - this.opts.tooltipOffset,
					top: handleOffset.top + this.$handle.height()/2
				};
				break;
			case 'right':
				position = {
					left: handleOffset.left + this.$handle.width() + this.opts.tooltipOffset,
					top: handleOffset.top + this.$handle.height()/2
				};
				break;
		}
		return position;
	}

	_getTooltipPositionForHandleWrapper(left, top){

		let position;
		let handleOffset = this.$handle.offset();

		switch (this.opts.tooltipDirection) {
			case 'top':
				position = {
					left: left,
					top: handleOffset.top - this.opts.tooltipOffset
				};
				break;

			case 'bottom':
				position = {
					left: left,
					top: handleOffset.top + this.$handle.height() + this.opts.tooltipOffset
				};
				break;
			case 'left':
				position = {
					left: handleOffset.left - this.opts.tooltipOffset,
					top: top
				};
				break;
			case 'right':
				position = {
					left: handleOffset.left + this.$handle.width() + this.opts.tooltipOffset,
					top: top
				};
				break;
		}

		return position;
	}

	/**
	 * @DateTime    2018/12/28 11:11
	 * @Author      wangbing
	*/
	_handleScrollToValuePosition() {

		clearTimeout(this._timer);
		this._timer = setTimeout(() => {
			this._setHandlePositionByValue(this.opts.value);
		}, this.opts.autoScrollDelayTime);

	}

}

(function($){

	$.fn.XSlider = function (opts) {

		let $this = $(this);
	
		if ($this.length > 1) {
			$this.each((index, el) => {
				$this.XSlide(opts);
			});
	
		} else {
			opts.el = $this;
			return new XSlider(opts);
	
		}
	};
	
})(window.jQuery);