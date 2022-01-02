"use strict"


class Route {
    dest = ""
    next = ""
    cost = 1

    constructor(dest,next,cost){
        this.dest = dest;
        this.next = next;
        this.cost = cost;
    }
}

class Router {
    name = ""
    neighbors = []
    routes = []
    constructor (name,neighbors, routes){
        this.name = name;
        this.neighbors = neighbors;
        this.routes = routes;
    }
}



class GlobalRouter {
    globalRouter = []

    constructor(){
    }

    getRouterbyName(name){
        let res = this.globalRouter.filter(r => r.name === name);
        return res;
    }

    addRouter(name){
        if (this.getRouterbyName(name).length == 0){
            let r = new Router(name, [], [])
            this.globalRouter.push(r);
        }
    }

    getRouterIndexByName(name){
        for (let i = 0; i < this.globalRouter.length; i++) {
            if (this.globalRouter[i].name === name){
                return i;
            }
        } 
    }

    addBidirectionnalRoute (srcName, destName, cost){
        if (srcName === destName){
            console.log("Impossible to self route");
            return;
        }
        
        let src = this.getRouterbyName(srcName);
        let dest = this.getRouterbyName(destName);

        if(src.length == 1 && dest.length == 1 ){
            src = src[0]
            dest = dest[0]

            let routesBuilt =  this.buildRoutes(src,dest.name,cost);
            let srcRoute = routesBuilt[0] 

            let nSrc = new Router(src.name, src.neighbors, srcRoute)
            let srcIndex = this.getRouterIndexByName(nSrc.name);
            if (!nSrc.neighbors.includes(dest.name)){
                nSrc.neighbors.push(dest.name)
            }
            this.globalRouter[srcIndex] = nSrc;

            routesBuilt = this.buildRoutes(dest,nSrc.name,cost);
            let destRoute = routesBuilt[0]
            let nDest = new Router(dest.name, dest.neighbors, destRoute)
            let destIndex = this.getRouterIndexByName(nDest.name);
            
            if (!nDest.neighbors.includes(nSrc.name)){
                nDest.neighbors.push(nSrc.name)
            }
            this.globalRouter[destIndex] = nDest;
            
           this.update(nSrc)
           this.update(nDest)
          

        } else {
            console.log ("At least one over two Router dosnt exist in the GlobalRouter")
        }
    }
    
    getAllDest(router) {
        let destinations = []
        router.routes.forEach(route => {
            destinations.push(route.dest);
        });
        return destinations;
    }

    update (src){
        src.neighbors.forEach(neighborName => {
            let neighbor = this.getRouterbyName(neighborName);
            if (neighbor.length === 1){
                neighbor = neighbor[0]
                let routeToSource = neighbor.routes.filter(route => route.dest === src.name)
                let upgraded = false;
           
                src.routes.forEach(sRoute => {
                    let neighborDestinations = this.getAllDest(neighbor)
                    if (neighborDestinations.includes(sRoute.dest)) {
                        for (let i = 0; i< neighbor.routes.length; i++){        
                            if (neighbor.routes[i].dest === sRoute.name) {
                                if (neighbor.routes[i].cost < (sRoute.cost + routeToSource[0].cost) ) {
                                    let newRoute = new Route (neighbor.routes[i].dest, src.name, sRoute.cost + routeToSource[0].cost)
                                    neighbor.routes[i] = newRoute;
                                    upgraded = true;
                                }
                            }
                        }
                    } else {
                        let newRoute;
                        if (sRoute.dest === neighbor.name && src.name !== neighbor.name){
                            newRoute = new Route (sRoute.dest,neighbor.name,0);
                        } else {
                            newRoute = new Route (sRoute.dest,src.name, (sRoute.cost + routeToSource[0].cost ));
                        }
                        neighbor.routes.push(newRoute);
                        upgraded = true;
                        
                    }
                    
                })

                if (upgraded === true ){
                    let destionations = this.getAllDest(neighbor)
                    destionations.forEach(dest => {
                        let filteredRoute = neighbor.routes.filter(route => route.dest === dest)
                        if (filteredRoute.length > 1) {
                            let min = filteredRoute[0];
                            for (let i =1; i<filteredRoute.length; i++){
                                if (min.cost > filteredRoute[i].cost){
                                    min = filteredRoute[i];
                                }
                            }
                            neighbor.routes = neighbor.routes.filter(route => {
                                if (route.dest === dest && route !== min) {
                                    return false
                                }
                                return true;
                            })
                            
                        }
                    });
                    
                    this.globalRouter[this.getRouterIndexByName(neighbor.name)] = neighbor;
                    this.update (neighbor);
                }
            } 
        });
    }

    buildRoutes (router, destName, cost){
        let upgraded = false;
        let filteredRoute = router.routes.filter(route => route.dest === destName)
        if (filteredRoute.length === 0){
            let newRoute = new Route(destName,destName,cost);
            router.routes.push(newRoute);
            upgraded = true;
            return [router.routes,upgraded]
        } else {
            let newRoute = new Route(destName,destName,cost);
            filteredRoute.push(newRoute);
            let min = filteredRoute[0];
            for (let i = 1; i<filteredRoute.length; i++){
                if (min.cost > filteredRoute[i].cost){
                    min = filteredRoute[i];
                    upgraded = true;
                }
            }
            let finalRoutes = router.routes.filter(route => route.dest !== destName)
            finalRoutes.push(min)
            return [finalRoutes,upgraded]  
        }

    }

    getRoutePath (srcName,destName){
        let src = this.getRouterbyName(srcName);
        if (src.length === 1) {
            src = src[0];
            let route = src.routes.filter(route => route.dest === destName)
            if (route.length === 0){
                return [];
            }
            route = route[0]
            if (srcName === destName){
                return [srcName]
            }
            return [srcName].concat(this.getRoutePath(route.next,destName)) 
        }
    }
}




let gr = new GlobalRouter();
gr.addRouter("R3")
gr.addRouter("R2")
gr.addRouter("R1")
gr.addRouter("R4")
gr.addRouter("R5")
gr.addRouter("R6")
gr.addBidirectionnalRoute("R2","R3",1)
gr.addBidirectionnalRoute("R1","R2",1)
gr.addBidirectionnalRoute("R1","R3",1)
gr.addBidirectionnalRoute("R5","R2",1)
gr.addBidirectionnalRoute("R1","R6",1)
gr.addBidirectionnalRoute("R3","R6",1)
gr.addBidirectionnalRoute("R4","R5",1)

//console.log("\n")

console.log(JSON.stringify(gr))
//console.log("\n")
console.log(gr.getRoutePath("R1","R4"))
