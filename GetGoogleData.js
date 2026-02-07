// import { Convert_Google } from "../Editor/G.js";

var ENV_KEY = "AIzaSyDUfrliF4ydB8G4JbQudiC4t8L39pG_E74"; // API KEY
// let URL = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=4.655719&location.longitude=-74.128971&requiredQuality=BASE&experiments=EXPANDED_COVERAGE&key=${ENV_KEY}`;



// let URL = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=37.4449703&location.longitude=-122.1391467&requiredQuality=BASE&experiments=EXPANDED_COVERAGE&key=${ENV_KEY}`;
// let URL = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=37.84174&location.longitude=-121.37877&key=AIzaSyDUfrliF4ydB8G4JbQudiC4t8L39pG_E74`
// console.log(URL);

// 38.1265454, -121.300558 \\

export async function GetSolarDataByCoords(Lat, Lon) {
    let URL = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${Lat}&location.longitude=${Lon}&key=${ENV_KEY}`;
    const response = await fetch(URL);
    const content = await response.json();
    if (response.status != 200) {
        // console.error('findClosestBuilding\n', content);
        throw content;
    }
    // console.log('buildingInsightsResponse', content);
    // console.log("File content:", fileContent);
    // Process the file content here
    let RawJSON = content; //JSON.parse(content);
    // ExecuteGoogle(RawJSON);
    // let Data = Convert_EagleView(RawJSON);
    let Data = RawJSON; // Convert_Google(RawJSON);
    // console.log(Data);
    // let RuntimeData = GetRuntimeData(Data);
    // Something(RuntimeData);
    return await Data; // JSON.stringify(Data);
}