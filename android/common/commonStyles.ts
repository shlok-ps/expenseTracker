import { StyleSheet } from "react-native";

const commonStyles = StyleSheet.create({
  settingsLabel: { marginTop: 10, fontSize: 14, fontWeight: '300' },
  modalView: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
})

export default commonStyles;
