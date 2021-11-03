# Map-webgl

The data can be found [here](https://drive.google.com/drive/folders/1zrnqPXw9se_IdKcyerjaCF4sMmbS8nQ_?usp=sharing) and should be placed in the /assets folder.

- `big_cloud.glb` test data to display
- `small_cloud.glb` small amount of data, useful for development.

## Decisions

The provided structure was used for the faster development.

The code for making the data visible to the camera was put in the denoted areas. The position of each Points Mesh was changed to be in the center of the world and the camera was moved at a better position to provide a better initial view.

Regarding the user point selection, we are raycasting at the direction that the user clicked and we pick the closest intersecting point. The interected point is logged in the console and its colour is changed to red.

Regarding the performance of the application, some simple optimizations were utilized like changing the antialiasing setting of the scene, tweaking the matrixAutoUpdate of the points and conditional rendering based on the user interaction with the scene.  
The raycasting could be sped up by using a package like [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) but it was not implemented due to time constraints and because there are more important performance issues.  
LOD meshes were given a try but there were some problems with the resulting meshes and that is why they were not eventually implemented.  
Merged Geometries, despite reducing the draw calls, were not improving the performance.  
Some time was dedicated to converting the assets to data formats compatible with [potree](https://github.com/potree/potree) so that we could use them with a library similar to [pnext/three-loader](https://github.com/pnext/three-loader) but it was not viable to have it done quickly. A solution like that could be viable for a very big amount of points.

## Install

To install dependencies run:

    yarn

## Development

    yarn start

Serves the development build on `http://localhost:8080/index.html`, which will rebuild on file changes.
