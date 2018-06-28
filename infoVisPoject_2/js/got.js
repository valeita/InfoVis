
//Array iniziali di personaggi e relazioni tra personaggi
var characters,
relations;

//dimensioni della tela
var diameter = 500,
    radius = diameter / 2,
    innerRadius = radius - 120;
	
//Creiamo la "tela" di disegno
var svg = d3.select("body").append("svg")
    .attr("width", diameter*3)
    .attr("height", radius*3)
    .append("g")
    .attr("transform", "translate(" + (radius*1.5+10) + "," + radius*1.5 + ")");


//vari gruppi per link, testo e nodi
var	link = svg.append("g").attr("class","link").selectAll(".link"),
        text = svg.append("g").attr("class","node").selectAll(".node"),
	node = svg.append("g").attr("class","nodo").selectAll(".nodo"),
        house = svg.append("g").attr("class","house").selectAll(".house")
        image = svg.append("g").attr("class","image").selectAll(".image");

//fun per creare le linee	
var lineFunction = d3.line()
    .curve(d3.curveBundle.beta(0.85))
//    .curve(d3.curveCatmullRom)
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });
	
//peopleMap è la mappa generale contente id, posizione x,y , array di source e target	
var peopleMap=new Map();

d3.json("data/got.json").then(function(data) {
  characters = data.graphml.graph.node;
  relations = data.graphml.graph.edge;

//order by house-birth
characters=orderByHouse(characters);

//Legend
var legendData = [{rel:"Parent",color:"#2c2c2c"},
		{rel:"Sibling",color:"#817ac2"},
		{rel:"Lover",color:"#d85555"},
		{rel:"Spouse",color:"#00cccc"},
		{rel:"Killed",color:"#75c46e"},
		{rel:"Alleggiance",color:"#f2b16a"},
		];
var px= 10,
	rectWidth=300,
	rectHeight=200,
	positionLegX = 400,
	positionLegY = 150;

var borderPath = svg
  .append("g")
  .attr("class","bordo");
borderPath
	.append("rect")
    .attr("x", positionLegX)
    .attr("y", positionLegY-5)
    .attr("height", rectHeight)
    .attr("width", rectWidth)
    .style("stroke", "black")
    .style("fill", "#f3f3f3")
     .style("stroke-width", 1);
	 
var linex1=70,
	linex2=20,
	space = 30,
	spaceFromBoard=10;
var legendLine = svg.selectAll("line")
				.data(legendData)
				.enter()
				.append("line")
                .attr("x1", linex2)
                .attr("y1", function(x,i){return (i*space+px);})
                .attr("x2", linex1+50)
                .attr("y2", function(x,i){return (i*space+px);})
				.attr("transform","translate("+positionLegX+","+(positionLegY+spaceFromBoard)+")")
                .attr("stroke-width", 2)
                .attr("stroke", function(x){return x.color});
				
var textLegend = svg.selectAll("text")
				.data(legendData)
				.enter()
				.append("text")
				.text(function(d) {return d.rel})
				.attr("x", function(d) {
					return linex2+linex1;
				})
				.attr("y", function(d,i) {
					return i*space+px; ;
				})
				.attr("font-family", "Got")
				.attr("font-size", "12px")
				.attr("fill", "Black")
				.attr("transform","translate("+(positionLegX+linex1-10)+","+(positionLegY+spaceFromBoard+5)+")");

//NODE  
  node = node
    .data(characters)
    .enter()
    .append("circle")
      .attr("cx",0)
      .attr("cy",0)
      .attr("r",4)
      .attr('fill', 'black')
      .attr('stroke',"black")
      .attr('stroke-width',1)
      .attr("transform",function(d,i){
          peopleMap.set(characters[i].id,{
                        pos:{x:radius*Math.cos((i*360/84)*Math.PI/180),y:radius*Math.sin((i*360/84)*Math.PI/180)},
                        sources:[],
                        targets:[]
                        });
          return "translate ("+radius*Math.cos((i*360/84)*Math.PI/180)+ ","+radius*Math.sin((i*360/84)*Math.PI/180)+")"});

//TEXT
  text = text
    .data(characters)
    .enter()
    .append("text")
      .attr("dy", "0.31em")
      .attr("transform", function(d,i) {var angle=i*360/84; return "rotate(" + (angle) + ")translate(" + (radius+15) + ",0)" + ((angle < 90 || angle >270 ) ? "" : "rotate(180)"); })
      .attr("text-anchor", function(d,i) {var angle=i*360/84; return (angle < 90 || angle >270 ) ? "start" : "end"; })
      .text(function(d,i) { return characters[i].data[findKeyID(characters[i].data,'name')].text ; })
	  .on("mouseover",lightOn)
	  .on("mouseout",lightOff);

//LINK

    link = link
        .data(relations)
        .enter()
        .append("path")
	.attr("d",function(connect,i){
	    //init
	    var sources_list=[],
            targets_list=[];
            var path=[],
            source=peopleMap.get(connect.source),
            target=peopleMap.get(connect.target);
            //create the path
            path.push(source.pos);
            path.push(findTension(source.pos,target.pos));  //middle point
            path.push(target.pos);
            //update peopleMap with relationships
            source.sources.push(i);
            target.targets.push(i);
	    return lineFunction(path);
        });/*
	.classed("link--killed", function(l) {var data=findRelation(l.data); if(data.text === "killed") return true; })
	.classed("link--allegiance", function(l) {var data=findRelation(l.data); if(data.text === "allegiance") return true; })
	.classed("link--mother", function(l) {var data=findRelation(l.data); if(data.text === "mother") return true; })
	.classed("link--lover", function(l) {var data=findRelation(l.data); if(data.text === "lover") return true;})
	.classed("link--father", function(l) {var data=findRelation(l.data); if(data.text === "father") return true; })
	.classed("link--sibling", function(l) {var data=findRelation(l.data); if(data.text === "sibling") return true; })
	.classed("link--spouse", function(l) {var data=findRelation(l.data); if(data.text === "spouse") return true; });*/

});
		/*SUPPORT FUNCTIONS*/

function findKeyID(node,key){
    for(i=0; i<node.length;i++){
         if(node[i].key==key) return i;
    }
    return null;
}

function findRelation(data_link){
    if(data_link.length>1) return data_link[1];
    return data_link;
}

function findTension(source,target){
    var tensionPoint={x:0,y:0};
    //calcolare il baricentro (dovrebbe essere diviso 3)
    tensionPoint.x=(source.x+target.x)/3.5;
    tensionPoint.y=(source.y+target.y)/3.5;
    return tensionPoint;
}

function orderByHouse(people){
	
    var houses_map = new Map(),
        houses_list = [],
        house,
        houseID;

    people.forEach(function(e){
        houseID=findKeyID(e.data,'house-birth');
        //find house
        if(houseID!=null) house=e.data[houseID].text;
        else house='none';

        if(houses_map.has(house)) {
            houses_list = houses_map.get(house);
            houses_list.push(e);
            houses_map.set(house,houses_list);
        }
        else houses_map.set(house,[e]);
    });
   

    var ordered_people=[];
    houses_map.forEach(function(h){
        h.forEach(function(e){ordered_people.push(e)});
    });
    return ordered_people;
}
		
function isConnected(node,sourcesLink,targetLink){
	var data_link=null;
	
	sourcesLink.forEach(function(indx){
	if (relations[indx].target == node.id) {data_link=findRelation(relations[indx].data);};
	});
	targetLink.forEach(function(indx){
	if (relations[indx].source == node.id) {data_link=findRelation(relations[indx].data);};
	});
	return data_link;
}	
		/*INTERATION FUNCTIONS*/
function lightOn(d,i){

	var linkSource=[],
	    linkTarget=[];
	    linkSource = peopleMap.get(d.id).sources;
	    linkTarget = peopleMap.get(d.id).targets;

	link.attr("class",function(l){
			var data=findRelation(l.data);
			if(data!=null && (l.source === d.id || l.target === d.id )){return "link--"+data.text;}
				else return "link";					
	})
        .classed("link--light", function(l) { if (l.source === d.id || l.target === d.id ) {return true; }});; 

	text.attr("class",function(n){
			var data = isConnected(n,linkSource,linkTarget);
			if(data!=null){return "node--"+data.text;}
				else return "node";					
	}); 
        showDetails(d,i);
}
function lightOff(d){
    link
        .classed("link--light", false)
   	.classed("link--killed", false )
	.classed("link--allegiance", false)
	.classed("link--mother", false)
	.classed("link--lover", false)
	.classed("link--father", false)
	.classed("link--sibling", false)
	.classed("link--spouse", false);
    text
	.classed("node--killed", false )
	.classed("node--allegiance", false)
	.classed("node--mother", false)
	.classed("node--lover", false)
	.classed("node--father", false)
	.classed("node--sibling", false)
	.classed("node--spouse", false); 

     removeDetails(d,i);
}

function showDetails(d,i){
    //IMAGE

    var name=characters[i].data[findKeyID(characters[i].data,'name')].text,
        nameID=name.toLowerCase().replace(/ /gi,'-');
    var path_to_file="image/character/"+name+".png";

    var ImageFolder = 'image/character/',
        fileName = name+'.jpg',
        path_to_file = ImageFolder+fileName;

    var defs = svg.append('defs');
    defs.append('pattern')
        .attr('id',nameID)
        .attr('height','100%')
        .attr('width','100%')
        .attr('patternContentUnits','objectBoundingBox')
        .append('image')
        .attr('height', 1)
        .attr('width', 1)
        .attr('preserveAspectRatio','none')
        .attr('xlink:href',path_to_file);
    var r=100;
    var circle = svg.append('g').attr('class','image')
        .append('circle')
        .attr('id','circle')
        .attr('r',r)
        .attr('x',0)
        .attr('y',0)
        .attr('stroke','black')
        .attr('stroke-width',2)
        .attr('fill','url(#'+nameID+')');
    var info = svg.append('g').attr('class','text_image').selectAll('.text_image');
        angle=[];
    if(d.data.length==1) angle=[0];
    if(d.data.length==2) angle=[-10,10];
    if(d.data.length==3) angle=[-20,0,20];
    if(d.data.length==4) angle=[-30,-10,10,30];
    info.data(d.data).enter()
        .append('text')
        .attr('id','text_image')
        .attr("transform", function(data,i) {
            var Vx=(15) +r*Math.cos(angle[i]*Math.PI/180);
                Vy=r*Math.sin(angle[i]*Math.PI/180);
            return "translate(" + (radius*2+Vx) + ","+(-radius*0.8+Vy)+")rotate("+(angle[i])+")"})
        .text(function(data) {return data.key.replace(/-/gi," - ")+'  :  '+data.text; });
        
    circle.attr('transform','translate('+radius*2+','+(-radius*0.8)+')');
}

function removeDetails(d,i){
    svg.selectAll('#text_image').remove();
    svg.select('#circle').remove();
}
