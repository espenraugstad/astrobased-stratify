async function getUser(){

    const profilePicture = document.getElementById("profilePicture") as HTMLImageElement;
    const userName = document.getElementById("userName");

    if(!userName || !profilePicture){
        return;
    }
    
    const token = localStorage.getItem("access_token");

    if(!token){
        userName.innerText = "Not logged in";
        return;
    }

    const res = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    if(res.status != 200){
        console.log("Unable to fetch user");
        console.error(res);
    } else {
        const userData = await res.json();
        userName.innerText = userData.display_name;
        profilePicture.src = userData.images[0].url;
    }
}

getUser();