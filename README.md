# xslide
Jquery xSlide UI

- step 1: just link the js after jquery
- step 2: link the css
- STEP 3: you are all done

xSlider: Range Slider Plugin Examples

## 1. Basic
```
$('#demo1').XSlider({
    min:0,
    max:10,
    value:5
});
```
## or
```
new XSlider({
    el: '#demo1-1a',
    min:0,
    max:10,
    value:5
});
```

## 2. Vertical
```
$('#demo2').XSlider({
    min:0,
    max:10,
    value:5,
    direction: 'vertical', //horizontal|vertical
});
```

## 3. Step Size
```
$('#demo3').XSlider({
    min:0,
    max:10,
    value:5,
    step:0.5,
    onChange(val){
        console.log(val);
    }
});
```

## 4. Tooltip
```
$('#demo4').XSlider({
    min:0,
    max:10,
    value:5,
    tooltip: true,
    tooltipOffset: 15,
    tooltipDirection: 'bottom',
    tooltipFormat: function(val){
        return 'Val: <span style="color:red">' + val + '</span>';
    }
});
```

## 5. Custom slider handle
```
$('#demo5-1').XSlider({
    min: 1,
    max: 3,
    value: 1,
    handleAutoSize: true,
    autoScroll: true,
    autoScrollDelayTime: 800,
});
```
## or
```
$('#demo5-2').XSlider({
    min: 1,
    max: 3,
    value: 1,
    handleAutoSize: false,
    autoScroll: false,
});
```

## 6. Custom Styles
```
$('#demo6-1').XSlider({
    min: 1,
    max: 3,
    value: 1,
    className: 'mobile',
    handleAutoSize: true
});
```
## or
```
$('#demo6-2').XSlider({
    min: 1,
    max: 3,
    value: 1,
    className: 'mobile',
    handleAutoSize: false
});
```
## 7. Set/Get Value
```
Set value: 2  Set handleAutoSize: true  Get value
let slider7 = $('#demo7').XSlider({
    min: 1,
    max: 3,
    value: 1,
    className: 'mobile',
    handleAutoSize: false
});
```
## Other way to get or get value
```
slider7.setOptions({value: 2});
slider7.setOptions({handleAutoSize: true});
slider7.getValue();
```
