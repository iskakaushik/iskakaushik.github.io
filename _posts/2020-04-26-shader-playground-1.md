---
layout: post
title:  "Shader Playground"
date:   2020-04-26 12:09:01 -0800
image: TODO Kaushik
categories: graphics
---


<style>
.canvas {
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 700px;
}

.codeAndCanvas {
    height:auto;
    min-height:250px;
    clear:both;
    display: block;
    min-width: 800px;
}

.codeAndCanvas canvas {
    float: right;
    position: relative;
    z-index: 1;
}

.codeAndCanvas .ge_editor {
    background: #ECECEC;
}

.CodeMirror {
    background: #ECECEC;
    font-size: 14px;
    line-height: 1.5em;
}

.simpleFunction {
    margin-left: auto;
    margin-right: auto;
    max-width: 700px;

}

.simpleFunction .CodeMirror {
    background: #F9F9F9;
    font-size: 14px;
    line-height: 1.5em;
}

.simpleFunction canvas {
    float: top;
    position: relative;
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 700px;
}

.cm-s-default .cm-variable-3 {
    color: #708;
}

.cm-s-default .cm-keyword {
    color: #708;
}

.ge_tooltip_modal {
    background-color: #B4B4B4;
}

.ge_tooltip_modal p {
    color: #000000;
}

.ge_tooltip_modal a {
    color: #FEFFFF;
}

.ge_export_modal {
    box-shadow: none;
}

.ge_colorpicker_link-button {
    color: #333;
}
</style>

 <!-- GlslCanvas -->
<script type="text/javascript" src="https://thebookofshaders.com/glslCanvas/GlslCanvas.js"></script>

<!-- GlslEditor -->
<link type="text/css" rel="stylesheet" href="https://thebookofshaders.com/glslEditor/glslEditor.css">
<script type="application/javascript" src="https://thebookofshaders.com/glslEditor/glslEditor.js"></script>


I started reading [The Book of Shaders](https://thebookofshaders.com/) -- which I'm thoroughly enjoying. One of the exercises in the book was to replicate the sunset from William Turner - The Fighting Temeraire. Over time, I started to really appreciate the image and the colors in it.

![](https://lh5.googleusercontent.com/crU_--hg5WVxSHMp7nNB_mm-3gfLJRiaQ5nyHRkFXPGTgzAUlrz1NVgGGy8tLiknkXvqXJFWeFdwUNNjO0rTlF52KP4D07HtWScFi6MtmuFgaNmPY787VzNJnY_2o9XrEP817EmZ)

Before I got started with this, to improve my gradient foo, I decided to go explore creating simpler gradients. Thanks to [Adobe Color](https://color.adobe.com/), I was able to find some of the key colors in the image.

![](https://lh5.googleusercontent.com/OuIginX4IlDMg9DqvHKPI5lnypJ-nTfALKsa1K-Mbe1dX5_mTDFV8WYgryDROCuHWUzkrWs7GvDxeekGrGUzjcnTPSUteCny9yvhUHfaVqlGQntxWhOTrNQymYp-xprVn1WXXD8l)

## Blue to orange diagonal gradient

Linear gradient from top-left to bottom-right blue to orange. In this I tried to capture the sun setting at bottom-right. This is infact a radial gradient.

<div id="blue_orange_diag" class="codeAndCanvas"></div>


## Light from the source

If you notice the original image, you will see that Sun isn't in the bottom right, rather its padded ~25% from both right and bottom.

<div id="light_from_source" class="codeAndCanvas"></div>

## Sky getting squeezed

The next thing that caught my eye wat the sky in between the Sun and the water. It looked like it was being squeezed between the two. This reminded my of a hyperbola. After playing around with some hyperbolic parameters. I was able to find something that resembled the blue.

<div id="sky_hyperbola" class="codeAndCanvas"></div>

<script type="text/javascript">
    function createEditableShader(shaderName) {
        fetch(`/assets/shaders/${shaderName}.frag`)
        .then((response) => {
            return response.text();
        }).then((text) => {
            var editorDiv = document.getElementById(shaderName);
            editorDiv.innerHTML = text;
            const glslEditor = new GlslEditor(`#${shaderName}`, { 
                theme: 'eclipse',
                watchHash: true,
                fileDrops: true,
                canvas_follow: true,
                canvas_float: 'right',
            });
        });
    }

    var elements = document.getElementsByClassName('codeAndCanvas');
    for (var i = 0; i < elements.length; i++) {
        console.log(elements[i]);
        createEditableShader(elements[i].id);
    }
</script>


