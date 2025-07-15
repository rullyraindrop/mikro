<script>
  const firebaseConfig = {
    apiKey: "AIzaSyAIZJ65VfJX-KWMS0hb05-WWhudMSsz-_c",
    authDomain: "mikro-c8998.firebaseapp.com",
    projectId: "mikro-c8998",
    storageBucket: "mikro-c8998.appspot.com",
    messagingSenderId: "180409134328",
    appId: "1:180409134328:web:fb0f479b8db3b1af5a1f0d",
    measurementId: "G-QEXHW4F7PV"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Modal Toggle Functions
  function toggleRegisterModal() {
    const modal = document.getElementById("registerModal");
    modal.style.display = modal.style.display === "flex" ? "none" : "flex";
    document.getElementById("signInModal").style.display = "none";
  }

  function toggleSignInModal() {
    const modal = document.getElementById("signInModal");
    modal.style.display = modal.style.display === "none" ? "flex" : "none";
  }

  // User Registration
  function registerUser() {
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const username = document.getElementById("regUsername").value.trim();
    const province = document.getElementById("regProvince").value;
    const city = document.getElementById("regCity").value;
    const kecamatan = document.getElementById("regKecamatan").value;
    const postal = document.getElementById("regPostalCode").value;
    const fullAddress = document.getElementById("regFullAddress").value;

    // Validation
    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("Password should be at least 6 characters");
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        // Set display name and default photo
        return user.updateProfile({
          displayName: username,
          photoURL: "default-user.png"
        }).then(() => {
          // Create user document in Firestore
          return db.collection("users").doc(user.uid).set({
            username,
            email,
            photoURL: "default-user.png",
            address: { province, city, kecamatan, postalCode: postal, fullAddress },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }).then(() => {
          // Send verification email
          return user.sendEmailVerification({ url: window.location.origin + "/index.html" });
        });
      })
      .then(() => {
        document.getElementById("registerModal").style.display = "none";
        alert("Verification email sent. Please check your inbox.");
      })
      .catch(error => {
        console.error("Registration error:", error);
        alert(error.message);
      });
  }

  // Email/Password Sign In
  function signInUser() {
    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value;

    auth.signInWithEmailAndPassword(email, password)
      .then(async userCredential => {
        // Reload user to get latest emailVerified status
        await userCredential.user.reload();
        if (userCredential.user.providerData[0].providerId === 'password' && !userCredential.user.emailVerified) {
          await auth.signOut();
          throw new Error("Please verify your email address first. Check your inbox.");
        }
        alert("Signed in successfully");
        toggleSignInModal();
      })
      .catch(error => {
        console.error("Sign in error:", error);
        alert(error.message);
      });
  }

  // Google Sign In
  function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(async result => {
        const user = result.user;
        // Check if user exists in Firestore
        const userRef = db.collection("users").doc(user.uid);
        const doc = await userRef.get();
        if (!doc.exists) {
          await userRef.set({
            username: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        alert("Signed in with Google successfully");
        toggleSignInModal();
      })
      .catch(error => {
        console.error("Google sign-in error:", error);
        alert("Google Sign-In failed: " + error.message);
      });
  }

  // Profile Menu Functions
  function toggleProfileMenu() {
    const menu = document.getElementById("profileMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  }
  document.addEventListener('click', function(event) {
    const profileContainer = document.querySelector('.profile-container');
    const profileMenu = document.getElementById("profileMenu");
    if (!profileContainer.contains(event.target) && profileMenu.style.display === 'block') {
      profileMenu.style.display = 'none';
    }
  });

  // Authentication State Listener
  document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged(async user => {
  
