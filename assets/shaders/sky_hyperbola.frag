// Author: Kaushik Iska
// Title: Playing With Gradients - 3

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

vec4 darkOrange=vec4(193,89,18,255.)/255.;
vec4 lightOrange=vec4(249,226,182,255.)/255.;
vec4 dirtyBlue=vec4(99,97,137,255.)/255.;

const float a=.15;
const float b=.05;
const float clampMax=1.;

float hyperbola(vec2 pt){
    float x=pt.x;
    float y=pt.y;
    float term1=pow(y-.3,2.)/pow(b,2.);
    float term2=pow(x-.8,2.)/pow(a,2.);
    return(term1-term2);
}

void main(){
    vec2 st=gl_FragCoord.xy/u_resolution.xy;
    
    float h=hyperbola(st);
    h=clamp(h,0.,clampMax)/clampMax;
    
    float distFromRight=sqrt(1.-st.x);
    h=(h+distFromRight)/(2.);
    vec4 pct=vec4(vec3(h),1.);
    vec4 hypColor=mix(dirtyBlue,lightOrange,pct);
    
    gl_FragColor=hypColor;
}
