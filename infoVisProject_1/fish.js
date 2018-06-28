         var width = 1300;
         var height = 1000;

         var svg = d3.select("#svgcontainer")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
         
         var fish = svg.append("g")
         .attr("class","fish")

            fish
            .append("ellipse")
            .attr("cx",150)
            .attr("cy",150)
            .attr("rx",60)
            .attr("ry",45)
            .attr("fill","black");

            fish
            .append("circle")
            .attr("cx",118)
            .attr("cy",121)
            .attr("r",13)
            .attr("stroke","black")
            .attr("stroke-width",3)
            .attr("fill","white");

            fish
            .append("circle")
            .attr("cx",119)
            .attr("cy",125)
            .attr("r",4)
            .attr("fill","black");

            fish
            .append("path")
            .attr("d","M130 112 Q 140 95, 180 90 Q 160 105, 180,112");

            fish
            .append("path")
            .attr("d","M138 188 C 158 233, 185 233, 168 188");

            fish
            .append("circle")
            .attr("cx",152)
            .attr("cy",198)
            .attr("r",12)
            .attr("fill","black");

            fish
            .append("path")
            .attr("d","M207 145 Q 200 105, 250 90 Q 214 152, 250 215 Q 195 210, 207 132");


          d3.select("body")
            .transition()
            .delay(200)
            .style("color","black");


      


         walk();
 

         function walk(){


            fish
            .attr("transform", "scale (1,1), translate(800,400)")
            .transition()
            .duration(13000)
            .attrTween("transform", translateLeft())
            .transition()
            .duration(13000)
            .attrTween("transform", translateRight())
            .on("end",walk)
         }




         function translateLeft(){

            return function(d, i, a) {
               return function(t) {


                  if(i%60 == 0){

                     createBubble(i,870,"left");
                  }

                  i=i+1;

                  
                  return "translate(" + (800-i) + "," + 400 + ")";
               }
            }
         }


         function translateRight(){

            return function(d, i, a) {
               return function(t) {

                  if(i%60 == 0){

                     createBubble(i,280,"right");
                  }

                  
                  i=i+1;
                  
                  return " scale (-1,1), translate(" + (-350-i) + "," + 400 + ")";
               }
            }
         }



         function createBubble(position,offset,direction){

            if(direction == "right"){
               realPosition = position
            }
            else{
               realPosition = -position
            }

            bubble = svg
            .append("circle")
            .attr("cx",(realPosition+offset))
            .attr("cy",510)
            .attr("r",11)
            .attr("stroke","black")
            .attr("stroke-width",2)
            .attr("fill","white");

            bubble
            .transition()
            .duration(15000)
            //.attr("transform", "translate("+ 0 + ", -410 )")
            .attrTween("transform", goUp(0,true))
            .remove();


         }


         function goUp(path,decision){

            return function(d, i, a) {
               return function(t) {

                  if(decision){
                     path = path+1;
                  }
                  else{
                     path = path-1
                  }

                  if(path >= 20){
                     decision = false;
                  }
                  if(path <= -20){
                     decision = true;
                  }
                  
                  i = i+1;

                  return "translate("+ path + "," + (-i) + " )";
               }
            }
         }


