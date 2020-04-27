---
layout: post
title:  "Shader Playground"
date:   2020-04-26 12:09:01 -0800
image: TODO Kaushik
categories: graphics
---

<link type="text/css" rel="stylesheet" href="/assets/css/shader_editor.css" />

<!-- GlslEditor -->
<link type="text/css" rel="stylesheet" href="/assets/third_party/glslEditor/glslEditor.css">
<script type="application/javascript" src="/assets/third_party/glslEditor/glslEditor.js"></script>


I started reading [The Book of Shaders](https://thebookofshaders.com/) -- which I'm thoroughly enjoying. One of the exercises in the book was to replicate the sunset from William Turner - The Fighting Temeraire. Over time, I started to really appreciate the image and the colors in it.

<img src="/assets/img/turner.jpg" />

Before I got started with this, to improve my gradient foo, I decided to go explore creating simpler gradients. Thanks to [Adobe Color](https://color.adobe.com/), I was able to find some of the key colors in the image.

<img src="/assets/img/turner-theme.png" />

## Blue to orange diagonal gradient

Linear gradient from top-left to bottom-right blue to orange. In this I tried to capture the sun setting at bottom-right. This is infact a radial gradient.

<div id="blue_orange_diag" class="codeAndCanvas"></div>


## Light from the source

If you notice the original image, you will see that Sun isn't in the bottom right, rather its padded ~25% from both right and bottom.

<div id="light_from_source" class="codeAndCanvas"></div>

## Sky getting squeezed

The next thing that caught my eye wat the sky in between the Sun and the water. It looked like it was being squeezed between the two. This reminded my of a hyperbola. After playing around with some hyperbolic parameters. I was able to find something that resembled the blue.

<div id="sky_hyperbola" class="codeAndCanvas"></div>


## Two suns and a river

The next experiment I decided to try was to blend in two radial graidents. One for the sun on the top and the other for the reflection below. Blending these in with the river (modeled as a hyperbola) was the effect that I wanted to achieve.

<div id="two_suns_and_a_river" class="codeAndCanvas"></div>


## Conclusion

There are definitely extensions to this that would get the resulting render closer to the image, but at this point I felt like I'll be fine tuning my techniques to get the result closer but not learning as fast as I'd like in the process. I decided to pause this expermient for a bit and continue my exploration.

Towards the end I was satisfied with the effect that the shader resulted in. I enjoyed reading up on coordinate geometry, and also enjoyed staring at Turner's image for a while. I plan on continuing my experiments with shaders.

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


