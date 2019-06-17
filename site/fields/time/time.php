<?php

class TimeField extends InputField {

  public $override = false;

  public function __construct() {
    $this->icon = 'clock-o';
    $this->label = l::get('fields.time.label', 'Time');
    $this->format = 'H:i';
  }

  public function value() {
    $value = $this->override()
      ? $this->default()
      : parent::value();

    if ($value === 'now') {
      return date($this->format, time());
    }

    if (empty($value) || strtotime($value) === false) {
      return $value;
    }

    return date($this->format, strtotime($value));
  }

  public function validate() {
    $value = $this->value();

    return date($this->format, strtotime($value)) === $value;
  }

}