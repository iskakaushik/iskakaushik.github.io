---
layout: post
title:  "Scanline Racer"
date:   2019-12-07 07:56:01 -0800
image: https://iska.is/assets/img/double_buffer.png
categories: graphics
---

I was recently talking to one of the engineers who worked on [Daydream](https://en.wikipedia.org/wiki/Google_Daydream). I realized how little I knew about the challenges in making a VR platform. One thing that struck me as particularly interesting was a rendering technique called "scanline racing". As someone who is currently working on Graphics, I found it to be fascinating.

Problem
-------

VR has stricter latency requirements than other interactive 3D applications. This is because for humans to feel "immersed" in a virtual scene, the window for an application to render a scene is many times stricter than a typical game. For reference, games generally have latency from mouse movement to screen update of 50 ms or higher (sometimes much higher).

### Motion-to-photon latency

The time from when the user moves their head or moves an input device, to the time when that change appears on the display is referred to as motion-to-photon latency. For most users to be comfortable and for VR to feel immersive, the motion-to-photon latency needs to be under 20ms.

Double Buffering is a source of latency
---------------------------------------

Before we get into how double buffering can introduce extra latency, let's look at what scanout buffer is and talk briefly about double buffering.

### Scanout Buffer

Towards the end, all graphics cards generate a frame buffer, this is a block of memory with 3 bytes per pixel, being the RGB color to show at that pixel on the screen. The frame buffer known to the graphics card is the scanout buffer or the front buffer is the one that will be displayed.

#### Simple vs Modern Graphics cards

1.  Very simple graphics cards do very little other than supporting a frame buffer and associated output circuitry. They want the operating system to write RGB values into that buffer. Libraries in the operating system then provide more sophisticated APIs for 2-D graphics or 3D graphics, and use software algorithms running on the CPU to compute the color of pixels to be written to the framebuffer.

2.  More sophisticated cards provide various ways for an operating-system to offload the work of mapping graphics operations into pixel-colors from the CPU to the graphics card. They provide SIMD instructions for programmable shaders, but in the end there is a frame buffer that is displayed.

### Double Buffering

Traditionally, rendering is double-buffered, which means there are two buffers stored in GPU memory: These are the front buffer and an additional back buffer. At the end of each frame, the two are swapped synchronously. This swap is generally an address change in a register which defines what is the front buffer.

The GPU never renders to the same buffer that's being scanned out -- this prevents artifacts due to potentially seeing parts of an incomplete frame or screen tears.

The effect of increased latency is due to vsync, which causes the front and back buffer swaps to synchronize with the vblank of the monitor. Double buffering itself doesn't cause this issue and it is useful to minimize flickering because pixels can only change once in the front buffer.

<center>
  <canvas id="double_buffer_canvas"  width="500" height="500">
  </canvas>

  <p id="double_buffer_info">&nbsp;</p>
</center>

To remove this particular latency single buffering can be used. There is no back buffer, we always render to the front buffer. Once this is in-place we will no longer incur the latency due to the synchronization.

Scanline Racing
---------------

To render directly to the front buffer, one has to time things very carefully. The idea us to render each line to the front-buffer before the scanline gets there. This is called "scanline racing" or "racing the beam". We obviously no longer have a "beam" to race, this word remains from the CRT days.

Based on some reading this technique doesn't seem to require us to render things line-by-line, we can do this strip-by-strip or any other sequential fragmented method.

This can shave-off a few millis from each scan-line pass, but double buffering existed for a reason. It is much easier to reason about a system which lets you read the whole buffer during the frame interval, that one where you have to precisely calculate the window where the edits are permitted. This is a really cool technique nonetheless.

Discuss on [Hacker News](https://news.ycombinator.com/item?id=21740304).

<!-- <center>
  <canvas id="scl_racer_canvas"  width="500" height="500">
  </canvas>
</center> -->

<script src="/assets/js/double_buffer_bundle.js"></script>
<!-- <script src="/assets/js/scanline_racer_bundle.js"></script> -->

<script>
  window.RenderDblBuffer();
  // window.RenderSclRacer();
</script>


### References:

1.  Christian Pötzsch's post about strip rendering: <https://www.imgtec.com/blog/reducing-latency-in-vr-by-using-single-buffered-strip-rendering/>

2.  John Carmack's post about latency mitigation strategies: <https://web.archive.org/web/20140719085135/http://www.altdev.co/2013/02/22/latency-mitigation-strategies/>

3.  <http://blogs.valvesoftware.com/abrash/latency-the-sine-qua-non-of-ar-and-vr/>
