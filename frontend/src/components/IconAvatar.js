import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  primary: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(4.5),
    height: theme.spacing(4.5)
  }
}));

const IconAvatar = (props) => {
  const { icon } = props;
  const classes = useStyles();
  return (
    <>
      {icon && (
      <Avatar className={classes.primary}>
        {icon}
      </Avatar>
      )}
    </>
  );
};

IconAvatar.propTypes = {
  icon: PropTypes.object.isRequired
};

export default IconAvatar;
