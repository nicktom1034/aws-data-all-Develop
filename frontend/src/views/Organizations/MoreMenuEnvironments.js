import { memo, useRef, useState } from 'react';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PropTypes from 'prop-types';

const MoreMenuEnvironments = (props) => {
  const anchorRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);

  const handleMenuOpen = () => {
    setOpenMenu(true);
  };

  const handleMenuClose = () => {
    setOpenMenu(false);
  };

  return (
    <>
      <Tooltip title="More options">
        <IconButton onClick={handleMenuOpen} ref={anchorRef} {...props}>
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorRef.current}
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'top'
        }}
        onClose={handleMenuClose}
        open={openMenu}
        PaperProps={{
          sx: {
            maxWidth: '100%',
            width: 256
          }
        }}
        transformOrigin={{
          horizontal: 'left',
          vertical: 'top'
        }}
      >
        <MenuItem
          onClick={() => {
            props.refresh();
          }}
        >
          <ListItemIcon>
            <RefreshIcon />
          </ListItemIcon>
          <ListItemText primary="Refresh" />
        </MenuItem>
      </Menu>
    </>
  );
};
MoreMenuEnvironments.propTypes = {
  refresh: PropTypes.func
};

export default memo(MoreMenuEnvironments);
