// Author: Kaushik Iska
// Title: Playing With Gradients - 1

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

float eps=.005;

vec3 darkOrange=vec3(193,89,18)/255.;
vec3 dirtyBlue=vec3(99,97,137)/255.;

float plot(vec2 st,float pct){
    return smoothstep(pct-eps,pct,st.y)-smoothstep(pct,pct+eps,st.y);
}

void main(){
    vec2 st=gl_FragCoord.xy/u_resolution.xy;
    vec3 color=vec3(0.);
    
    float dist=distance(st,vec2(1.,0));
    vec3 pct=vec3(dist)/sqrt(2.);
    
    color=mix(darkOrange,dirtyBlue,pct);
    
    // Plot transition lines for each channel
    color=mix(color,vec3(1.,0.,0.),plot(st,pct.r));
    color=mix(color,vec3(0.,1.,0.),plot(st,pct.g));
    color=mix(color,vec3(0.,0.,1.),plot(st,pct.b));
    
    gl_FragColor=vec4(color,1.);
}
