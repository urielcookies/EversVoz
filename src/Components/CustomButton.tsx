import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface CustomButtonProps {
  title: string;
  color?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  onPress: () => void;
  style?: object;
  textStyle?: object;
  loading?: boolean;
  disabled?: boolean;
  width?: string;
  icon?: string;
}

const CustomButton: React.FC<CustomButtonProps> = (props) => {
  const {
    title,
    color = 'default',
    onPress,
    style,
    textStyle,
    loading = false,
    disabled = false,
    width = '100%',
    icon,
  } = props;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { width, backgroundColor: bgcolor[color] },
        style,
        disabled && styles.disabledButton,
      ]}
      onPress={loading || disabled ? undefined : onPress}
      activeOpacity={loading || disabled ? 1 : 0.7} >
      <View style={styles.contentContainer}>
        {loading && <ActivityIndicator size="small" color="#fff" style={styles.loader} />}
        {icon && <Icon name={icon} size={20} color="#fff" style={styles.icon} />}
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const bgcolor = {
  default: 'rgba(52,160,171,255)',
  danger: 'rgba(255,69,58,255)',
  warning: 'rgba(255,193,7,255)',
  info: 'rgba(0,123,255,255)',
  success: 'rgba(40,167,69,255)'
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginRight: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  icon: {
    marginRight: 8,
  },
});

export default CustomButton;
