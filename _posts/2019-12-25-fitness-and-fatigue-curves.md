---
layout: post
title:  "Fitness and Fatigue Curves"
date:   2019-12-25 11:03:01 -0800
image: https://iska.is/assets/img/strava_stats.png
categories: graphics
---

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    extensions: [
      "MathMenu.js",
      "MathZoom.js",
      "AssistiveMML.js",
      "a11y/accessibility-menu.js"
    ],
    jax: ["input/TeX", "output/CommonHTML"],
    TeX: {
      extensions: [
        "AMSmath.js",
        "AMSsymbols.js",
        "noErrors.js",
        "noUndefined.js",
      ]
    }
  });
</script>

<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML">
</script>

I subscribed to [Strava](http://strava.com) Summit (their subscription based premium offering) as of 6 months ago. Thanks to some friends 2019 has been the best running year of my life. One of the perks of getting the premium is knowing your [Fitness & Freshness](https://support.strava.com/hc/en-us/articles/216918477-Fitness-Freshness-Summit-) levels.

<p style="text-align:center;">
  <img src="/assets/img/strava_stats.png" width="400"/>
</p>

Measuring in sports and fitness have fascinated me since I picked up weightlifting and running. So I wanted to get a sense for how individualized fitness is measured using running data.

Banister Impulse Response model
-------------------------------

Modeling individual response to stress has been studied by [Eric Banister in 1976](https://web.archive.org/web/20191226023243/https://www.math.fsu.edu/~dgalvis/journalclub/papers/11_28_2016.pdf). The linked paper documents how to measure impulse response in swimmers but was later modified to measure the same in runners and cyclists.

To adapt the model to any stressor (running/swimming/cycling or any exercise), he proposed heart rate based metric called **TRIMP**. From my understanding, the model works as follows:

1.  Convert each effort into a TRIMP score.

2.  Use the sequence of past TRIMP scores to predict two values:

    1.  **Fitness:** The positive influence (due to adaptation and other phenomenon) each effort  has on your future performance.

    2.  **Fatigue:** The negative effect (due to needed recovery time, muscle soreness etc) each effort has on your future performance.

Fitness outlasts Fatigue
------------------------

If you think of your efforts over time, each of them will result in a Fitness and Fatigue score as outlined above. You can think of the Fitness and Fatigue curves as the plot of these over time. One of the core postulates of the Banister model is that these curves decay with different half-lifes. Specifically, Fitness has a much higher half-life than Fatigue. What this means is that, if your current Fitness level is 10, it would take ~30 days to go to 0, while the same level of Fatigue would take ~8 days.

<p style="text-align:center;">
  <img src="/assets/img/strava_curves.jpg" width="600"/>
</p>

This was extremely pleasing to know, given that my workouts during holidays have stalled. Image courtesy Strava.

Performance
-----------

Performance is measured as the difference between the Fitness and Fatigue values. It would look something like this.

$$P(t) = p_0 + e^{- \lambda_{fitness} . t}*k_1 - e^{- \lambda_{fatigue} . t}*k_2$$


1.  $$p_0$$ is a constant that represents the baseline performance.

2.  $$\lambda_{fitness}$$ is the decay of fitness.

3.  $$\lambda_{fatigue}$$ is the decay of fatigue.

4.  $$k_1$$ and $$k_2$$ are coefficients that will be learned.

Given that this is a model with 5 parameters, we would need >= 5 observations to fit. "Form" is used in lieu of "Performance" in Strava.

Conclusion
----------

I hope this understanding of how your body reacts to training impulse and the fact that you will not lose your momentum by missing a couple of workouts in a row, will motivate you towards a stronger, faster and longer 2020.

Happy new year. I'm athlete [11386608](https://www.strava.com/athletes/11386608) in case you want a buddy to cheer you on!
