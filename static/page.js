box = document.getElementById("status_text")

bid = get_bucket_id()
pid = get_pg_id();
let pgData = "";

// Load page
async function update() {
    // Example usage
    let pagedata = {'username':un, 'session':sk, 'bucketid':bid, 'pageid':pid}
    send = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pagedata)
    }
    response = await fetch("/pages/get", send)
    data = await response.json()

    head = document.getElementById("pg_title")
    head.value = data["page"].title
    document.title = "p | " + data["page"].title

    oV = document.getElementById("order")
    oV.value = data["page"].porder

    vis = document.getElementById("vis")
    if (vis !== null) {
        vis.checked = data["page"].public
    }

    nav = data["nav"]

    var replacedStr = data["page"].description.replace(/\[\@\@\#%\]/g, "\"");
    pgData = replacedStr

    tinymce.activeEditor.setContent(replacedStr)

    window.onbeforeunload = function() {
   //     console.log(tinymce.activeEditor.getContent())
    //    console.log(pgData)
    //    if (tinymce.activeEditor.getContent() !== pgData) {
            return "Data will be lost if you leave the page, are you sure?";
    //    }
    };
}

async function save() {

    head = document.getElementById("pg_title").value
    body = tinymce.activeEditor.getContent({format : 'raw'});
    var replacedStr = body.replace(/"/g, '[@@#%]');

    visibility = document.getElementById("vis").checked
    porder = document.getElementById("order").value
    if (porder.replace(" ", "") === "") {
        porder = -1
    }

    let data = {
        "username":un, 
        "session":sk, 
        "title":head, 
        "content":replacedStr, 
        "bucketid":bid, 
        "pageid":pid, 
        "visibility":visibility, 
        "porder": porder
    }

    send = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }

    response = await fetch("/editor/pages/update", send)
    data = await response.json()

    if (data["resp"] == true) {
        window.onbeforeunload = function() {
            
        };
        
        window.location.href=("/bucket/" + bid)
    } else {
        alert("An error occured. Please save your content somewhere else and try again later.")
    }
}

async function del() {
    let confirm = window.confirm("Deleting this page is irreversable! Do you still want to delete?")

    if (confirm) {
        let data = {"username":un, "session":sk, "bucketid":bid, "pageid":pid}

        send = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
    
        response = await fetch("/editor/pages/delete", send)
        data = await response.json()
    
        if (data["resp"] == true) {            
            window.onbeforeunload = function() {};
            window.location.href=("/bucket/" + bid)
        }
    }
}

async function getExtraDict() {
    let pagedata = {'username':un, 'session':sk}
    send = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pagedata)
    }
    response = await fetch("/users/settings", send)
    data = await response.json()

    if (data["resp"]) {
        console.log(data.dict);
        return data.dict;
    } else {
        return [];
    }
}

function getDictLocation() {
    return "/static/dicts"
}

async function addWordToUserDict(word) {
    if (word !== "" ) {
        let pagedata = {'username':un, 'session':sk}
        send = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pagedata)
        }
        response = await fetch("/users/settings", send)
        data = await response.json()

        data.dict.push(word);
        let pdate = { 'username':un, 'session':sk, 'dictionary':data.dict}
        send = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pdate)
        }
        console.log("SND DATA: ", send);
        response = await fetch("/users/update", send)
        data = await response.json()

        if(!data["resp"]) {
            alert("Adding word did not work. Try again later.")
        }
    } else {
        alert("Please select something.")
    }
}