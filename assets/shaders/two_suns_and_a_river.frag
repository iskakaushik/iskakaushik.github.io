// Author: Kaushik Iska
// Title: Playing With Gradients - 4

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
vec2 locus=vec2(.8,.3);

float hyperbola(vec2 pt){
    float x=pt.x;
    float y=pt.y;
    float term1=pow(y-locus.y,2.)/pow(b,2.);
    float term2=pow(x-locus.x,2.)/pow(a,2.);
    return(term1-term2);
}

void main(){
    vec2 st=gl_FragCoord.xy/u_resolution.xy;
    
    float h=hyperbola(st);
    h=clamp(h,0.,clampMax)/clampMax;
    
    vec4 pct=vec4(vec3(h),1.);
    vec4 hypColor=mix(dirtyBlue,darkOrange,pct);
    
    float maxDist=distance(locus,vec2(0.,1.));
    float distFromLocus=distance(locus,st.xy)/maxDist;
    vec4 twoSuns=mix(darkOrange,lightOrange,distFromLocus);
    
    vec4 maskedMixture=vec4(vec3(smoothstep(.8,1.,h)),1.);
    vec4 riverAndTwoSuns=mix(hypColor,twoSuns,maskedMixture);
    
    gl_FragColor=riverAndTwoSuns;
}
