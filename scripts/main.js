// VOCABS
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');

const webbook = 'https://webbook.solid.community/profile/card#me'
const addressURL = 'https://webbook.solid.community/webbook/address.ttl'

var state = {}
state.loggedIn = null
state.user = {} // logged in user

function init () {
  addListeners()
}

async function displayUserName(webId) {
  // Set up a local data store and associated data fetcher
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  // Load the person's data into the store
  // and display username
  await fetcher.load(webId);
  const username = store.any($rdf.sym(webId), FOAF('name'));
  $('#username').text(username && username.value);
}

// HANDLERS
function handleLogin() {
  // login event
  solid.auth.trackSession(session => {

    const loggedIn = !!session;
    // Enabled when !loggedIn
    $('#login').toggle(!loggedIn);
    // Enabled when loggedIn
    $('#logout').toggle(loggedIn);
    $('#submit').toggle(loggedIn);

    if (session && session.webId) {
      state.user.webId = session.webId
      state.loggedIn = true
      
      displayUserName(session.webId)

      $('#submitted').text('');
    }

    if (!loggedIn) {
      $('#submitted').text('Log in to submit.');
    }

  })
};

// Log the user in and out on click
function addListeners() {
  let login = document.getElementById("login");
  let logout = document.getElementById("logout");
  let submit = document.getElementById("submit");
  // login and logout buttons
  const popupUri = "popup.html";
  login.addEventListener("click", () => solid.auth.popupLogin({
    popupUri
  }));
  logout.addEventListener("click", () => {
    state.loggedIn = false
    solid.auth.logout()
  });
  handleLogin();

  submit.addEventListener("click", () => {

    const query = ` INSERT DATA {
      <${state.user.webId}> ${FOAF('member')} <${webbook}>.
     }
     `
   
     console.log("query", query)
     solid.auth.fetch(addressURL, {
       method: 'PATCH',
       headers: { 'Content-type': 'application/sparql-update' },
       body: query,
       credentials: 'include'
     });

     $('#submitted').text("Thanks for your submission!");

  })
};

// MAIN
init()
