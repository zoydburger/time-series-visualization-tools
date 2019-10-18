import React from 'react';
import { FormControl, Typography, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  divider: { marginTop: 10, marginBottom: 10 },
  title: { marginTop: 30 },
  overline: { marginTop: 10 },
  caption: { marginLeft: 5 },
}));

export function FormHeader(props) {
  const classes = useStyles();
  const { title } = props;
  return (
    <FormControl className={classes.formControl}>
      <Typography className={classes.title} color="primary" variant="h6">
        {title}
      </Typography>
      <Divider className={classes.divider}></Divider>
    </FormControl>
  );
}

export function GadgetHeader(props) {
  const classes = useStyles();
  const { title, info } = props;
  return (
    <>
      <Typography
        color="textPrimary"
        className={classes.overline}
        variant="overline"
        style={{ fontSize: 14 }}
      >
        <b>{title}</b>
        {info ? (
          <Typography
            color="primary"
            className={classes.caption}
            variant="caption"
            gutterBottom
            style={{ fontSize: 12 }}
          >
            {'[ = ' + info + ' ]'}
          </Typography>
        ) : null}
      </Typography>
    </>
  );
}
