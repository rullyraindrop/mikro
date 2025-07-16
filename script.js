const firebaseConfig = {
  apiKey: "AIzaSyAIZJ65VfJX-KWMS0hb05-WWhudMSsz-_c",
  authDomain: "mikro-c8998.firebaseapp.com",
  projectId: "mikro-c8998",
  storageBucket: "mikro-c8998.appspot.com",
  messagingSenderId: "180409134328",
  appId: "1:180409134328:web:fb0f479b8db3b1af5a1f0d",
  measurementId: "G-QEXHW4F7PV"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function toggleRegisterModal() {
  const modal = document.getElementById("registerModal");
  modal.style.display = modal.style.display === "flex" ? "none" : "flex";
  document.getElementById("signInModal").style.display = "none";
}

function toggleSignInModal() {
  const modal = document.getElementById("signInModal");
  modal.style.display = modal.style.display === "none" ? "flex" : "none";
}

function registerUser() {
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const username = document.getElementById("regUsername").value.trim();
  const province = document.getElementById("regProvince").value;
  const city = document.getElementById("regCity").value;
  const kecamatan = document.getElementById("regKecamatan").value;
  const postal = document.getElementById("regPostalCode").value;
  const fullAddress = document.getElementById("regFullAddress").value;

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
      return user.updateProfile({
        displayName: username,
        photoURL: "default-user.png"
      }).then(() => {
        return db.collection("users").doc(user.uid).set({
          username,
          email,
          photoURL: "default-user.png",
          address: { province, city, kecamatan, postalCode: postal, fullAddress },
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }).then(() => {
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

function signInUser() {
  const email = document.getElementById("signInEmail").value.trim();
  const password = document.getElementById("signInPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = auth.currentUser; // ✅ Make sure we use the latest live auth object
      await user.reload(); // ✅ Get fresh verification status

      if (user.providerData[0].providerId === 'password' && !user.emailVerified) {
        await auth.signOut(); // Prevent access
        throw new Error("Please verify your email address first. Check your inbox.");
      }

      alert("Signed in successfully");
      toggleSignInModal();
    })
    .catch((error) => {
      console.error("Sign in error:", error);
      alert(error.message);
    });
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(async result => {
      const user = result.user;
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

function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

document.addEventListener('click', function (event) {
  const profileContainer = document.querySelector('.profile-container');
  const profileMenu = document.getElementById("profileMenu");
  if (!profileContainer.contains(event.target) && profileMenu.style.display === 'block') {
    profileMenu.style.display = 'none';
  }
});

// ✅ Auth State Listener — Single Clean Version
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
        return;
      }

      db.collection("users").doc(user.uid).get().then(doc => {
        const data = doc.exists ? doc.data() : {};
        const username = data.username || user.displayName || user.email.split('@')[0];
        greeting.textContent = `Welcome, ${username}`;
        greeting.style.display = "inline";
        signInBtn.style.display = "none";
        profileTab.style.display = "flex";

        const photoURL = user.photoURL || data.photoURL || "default-user.png";
        if (userPhoto) userPhoto.src = photoURL;
      }).catch(err => {
        console.error("Error fetching Firestore user:", err);
      });
    } else {
      greeting.style.display = "none";
      signInBtn.style.display = "inline";
      profileTab.style.display = "none";
      if (userPhoto) userPhoto.src = "default-user.png";
    }
  });
});

function deleteAccount() {
  const user = auth.currentUser;
  if (confirm("Are you sure you want to delete your account?")) {
    db.collection("users").doc(user.uid).delete()
      .then(() => user.delete())
      .then(() => {
        alert("Account deleted");
        window.location.reload();
      })
      .catch(error => alert(error.message));
  }
}

function signOutUser() {
  auth.signOut().then(() => {
    alert("Signed out");
    window.location.reload();
  });
}
