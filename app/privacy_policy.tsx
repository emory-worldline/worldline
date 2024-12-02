import { StyleSheet, Text, View } from "react-native";
import React from "react";

export default function PrivacyPolicy() {
  return (
    <View style={styles.container}>
         <Text style={styles.text}>Privacy Policy</Text>
         <Text style={styles.text}>
          Worldline values the privacy of its users.
          As such, we are committed to informing our users about what data is accessed by the application and how it is used.
         </Text>
         <Text style={styles.text}>
          The purpose of Worldline is to serve as an easy, legible, and interactive visualization of location data associated with the user’s photos.
          To achieve this, Worldline requires access to the following data:
         </Text>
         <Text style={styles.text}>
           - Photos saved on the user’s device{"\n"}
           - The date, time, and location of the user’s photos{"\n"}
           - Other photo metadata, including aspect ratios, device used to take photo, and file type
         </Text>
         <Text style={styles.text}>
           Upon opening the application for the first time, Worldline will request access to your photos.
           While this request can be denied, granting Worldline camera roll access is strongly recommended, as the application will not function correctly without it.
           Once access is granted, Worldline will not request it again on subsequent uses but will instead automatically begin fetching data.
           Please note that you can enable or disable Worldline’s camera roll access at any time through your device’s settings app.
         </Text>
         <Text style={styles.text}>
           In order to keep our users’ data safe and private, we do not store any user data.
           Photos and their metadata will not leave the device they started on, and only the individual user will have access to their personal data.
           Upon each startup, the application will fetch photo metadata that is used only locally on the user’s own device.
           Upon closing the application, it will no longer retain access to photos or photo metadata.
         </Text>
       </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#212121",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 15,
    textAlign: "left"
    paddingLeft: 20,
  },
  header: {
    color: "#FFFFFF",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },

});
