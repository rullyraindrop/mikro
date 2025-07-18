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

      // ✅ Set user's profile picture to the profile icon
      document.getElementById("userPhoto").src = user.photoURL || "default-user.png";

      // ✅ Close the modal
      document.getElementById("signInModal").style.display = "none";
      alert("Signed in with Google successfully");
    })
    .catch(error => {
      console.error("Google sign-in error:", error);
      alert("Google Sign-In failed: " + error.message);
    });
}

  // Profile Menu Functions
function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu.classList.toggle("hidden");
}

// Close profile menu when clicking outside
document.addEventListener("click", function (event) {
  const profileContainer = document.getElementById("profileTab");
  const profileMenu = document.getElementById("profileMenu");

  if (!profileContainer.contains(event.target)) {
    profileMenu.classList.add("hidden");
  }
});


// Click outside to close profile menu
document.addEventListener('click', function(event) {
  const profileIcon = document.getElementById('userPhoto');
  const profileMenu = document.getElementById('profileMenu');

  if (
    !profileMenu.contains(event.target) &&
    event.target !== profileIcon &&
    profileMenu.classList.contains("visible")
  ) {
    profileMenu.classList.remove("visible");
  }
});


  // Authentication State Listener
  document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged(async user => {
    const greeting = document.getElementById("userGreeting");
    const signInBtn = document.getElementById("signInBtn");
    const profileTab = document.getElementById("profileTab");
    const userPhoto = document.getElementById("userPhoto");

    if (user) {
      await user.reload();

      if (user.providerData[0].providerId === 'password' && !user.emailVerified) {
        alert("Please verify your email address. Check your inbox.");
        await auth.signOut();
        greeting.style.display = "none";
        signInBtn.style.display = "inline";
        profileTab.style.display = "none";
        if (userPhoto) userPhoto.src = "default-user.png";
        return;
      }

      db.collection("users").doc(user.uid).get()
        .then(doc => {
          const userData = doc.exists ? doc.data() : {};
          const username = userData.username || user.displayName || user.email.split('@')[0];
          greeting.textContent = Welcome, ${username};
          greeting.style.display = "inline";
          signInBtn.style.display = "none";
          profileTab.style.display = "flex";
          userPhoto.src = user.photoURL || userData.photoURL || "default-user.png";
        })
        .catch(error => {
          console.error("Failed to retrieve user data:", error);
        });
    } else {
      greeting.style.display = "none";
      signInBtn.style.display = "inline";
      profileTab.style.display = "none";
      if (userPhoto) userPhoto.src = "default-user.png";
    }
  });
});
    const signInBtn = document.getElementById("signInBtn");
    const profileTab = document.getElementById("profileTab");
    const userPhoto = document.getElementById("userPhoto");

    if (user) {
      // Reload to get updated emailVerified
      await user.reload();
      // If email/password user not verified, sign out and notify
      if (user.providerData[0].providerId === 'password' && !user.emailVerified) {
        alert("Please verify your email address. Check your inbox.");
        await auth.signOut();
        greeting.style.display = "none";
        signInBtn.style.display = "inline";
        profileTab.style.display = "none";
        return;
      }

      // Fetch Firestore data
      db.collection("users").doc(user.uid).get()
        .then(doc => {
          const userData = doc.exists ? doc.data() : {};
          const username = userData.username || user.displayName || user.email.split('@')[0];
          greeting.textContent = Welcome, ${username};
          userPhoto.src = user.photoURL || userData.photoURL || "default-user.png";
          greeting.style.display = "inline";
          signInBtn.style.display = "none";
          profileTab.style.display = "flex";
        })
        .catch(error => console.error("Error getting user data:", error));
    } else {
      // Signed out
      greeting.style.display = "none";
      signInBtn.style.display = "inline";
      profileTab.style.display = "none";
      if (userPhoto) userPhoto.src = "default-user.png";
    }
  });
</script>
