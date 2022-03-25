import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { TreeItem, TreeView } from '@mui/lab';
import { Box, CircularProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import * as BsIcons from 'react-icons/bs';
import listToTree from '../../utils/listToTree';
import searchGlossary from '../../api/Glossary/searchGlossary';
import useClient from '../../hooks/useClient';
import Scrollbar from '../../components/Scrollbar';
import { SET_ERROR } from '../../store/errorReducer';
import { useDispatch } from '../../store';
import * as Defaults from '../../components/defaults';

const useTreeItemStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.text.secondary,
    '&:focus > $content, &$selected > $content': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
      color: 'var(--tree-view-color)'
    },
    '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label':
      {
        backgroundColor: 'transparent'
      }
  },
  content: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '$expanded > &': {
      fontWeight: theme.typography.fontWeightRegular
    }
  },
  group: {
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(2)
    }
  },
  expanded: {},
  selected: {},
  label: {
    fontWeight: 'inherit',
    color: 'inherit'
  },
  labelRoot: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 0.5)
  },
  labelIcon: {
    marginRight: theme.spacing(1)
  },
  labelText: {
    fontWeight: 'inherit',
    flexGrow: 1
  }
}));
function StyledTreeItem(props) {
  const classes = useTreeItemStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    labelInfo,
    color,
    bgColor,
    ...other
  } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </div>
      }
      style={{
        '--tree-view-color': color,
        '--tree-view-bg-color': bgColor
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        label: classes.label
      }}
      {...other}
    />
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired
};

const useStyles = makeStyles({
  root: {
    height: 264,
    flexGrow: 1,
    maxWidth: 400
  }
});

const GlossarySearch = ({ matches, setQuery }) => {
  const client = useClient();
  const classes = useStyles();
  const dispatch = useDispatch();
  const [tree, setTree] = useState([]);
  const [fetchingItems, setFetchingItems] = useState(true);
  const [selectedTerms] = useState(matches.map((match) => match.key));
  const getIcon = (nodeItem) => {
    if (nodeItem.__typename === 'Glossary') {
      return <BsIcons.BsBookmark size={12} />;
    }
    if (nodeItem.__typename === 'Category') {
      return <BsIcons.BsFolder size={12} />;
    }
    return <BsIcons.BsTag size={12} />;
  };
  const select = (node) => {
    const terms = [node.nodeUri];

    setQuery({
      query: {
        terms: {
          glossary: terms.map((p) => p.toLowerCase())
        }
      },
      value: [node.label]
    });
  };
  const unselect = (node) => {
    const terms = [node.nodeUri];

    setQuery({
      query: {
        terms: {
          glossary: terms.map((p) => p.toLowerCase())
        }
      },
      value: [node.label]
    });
  };
  const isSelected = (node) => selectedTerms.indexOf(node.nodeUri) !== -1;

  const toggle = (node) => {
    if (isSelected(node)) {
      unselect(node);
    } else {
      select(node);
    }
  };
  const fetchItems = async () => {
    setFetchingItems(true);
    const response = await client.query(
      searchGlossary(Defaults.SelectListFilter)
    );
    if (!response.errors) {
      setTree(
        listToTree(response.data.searchGlossary.nodes, {
          idKey: 'nodeUri',
          parentKey: 'parentUri'
        })
      );
    } else {
      dispatch({ type: SET_ERROR, error: response.errors[0].message });
    }
    setFetchingItems(false);
  };
  useEffect(() => {
    if (client) {
      fetchItems().catch((e) =>
        dispatch({ type: SET_ERROR, error: e.message })
      );
    }
  }, [client]);
  return (
    <Box>
      {fetchingItems ? (
        <CircularProgress size={9} />
      ) : (
        <Box>
          {tree && tree.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                borderRadius: 1,
                backgroundColor: 'background.paper',
                flexDirection: 'column',
                maxWidth: '100%',
                height: '200px'
              }}
            >
              <Scrollbar options={{ suppressScrollX: true }}>
                <Box sx={{ mt: 2 }}>
                  <TreeView
                    className={classes.root}
                    defaultExpanded={['3']}
                    defaultCollapseIcon={<ArrowDropDownIcon />}
                    defaultExpandIcon={<ArrowRightIcon />}
                    defaultEndIcon={<div style={{ width: 24 }} />}
                  >
                    {tree.map((node) => (
                      <StyledTreeItem
                        nodeId={node.nodeUri}
                        onClick={() => toggle(node)}
                        labelText={
                          <Box
                            sx={{
                              display: 'flex',
                              ml: 1
                            }}
                          >
                            <Typography
                              sx={{
                                flexGrow: 1,
                                fontWeight: 'inherit'
                              }}
                              variant="caption"
                              color="textPrimary"
                            >
                              {node.label}
                            </Typography>
                          </Box>
                        }
                        labelIcon={() => getIcon(node)}
                      >
                        {node.children &&
                          node.children.map((category) => (
                            <StyledTreeItem
                              nodeId={category.nodeUri}
                              onClick={() => toggle(category)}
                              labelText={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    ml: 1
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      flexGrow: 1,
                                      fontWeight: 'inherit'
                                    }}
                                    variant="caption"
                                    color="textPrimary"
                                  >
                                    {category.label}
                                  </Typography>
                                </Box>
                              }
                              labelIcon={() => getIcon(category)}
                            >
                              {category.children &&
                                category.children.map((term) => (
                                  <StyledTreeItem
                                    nodeId={term.nodeUri}
                                    labelText={
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          ml: 1
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            flexGrow: 1,
                                            fontWeight: 'inherit'
                                          }}
                                          variant="caption"
                                          color="textPrimary"
                                        >
                                          {term.label}
                                        </Typography>
                                      </Box>
                                    }
                                    labelIcon={() => getIcon(term)}
                                    color="#1a73e8"
                                    bgColor="#e8f0fe"
                                    onClick={() => toggle(term)}
                                  />
                                ))}
                            </StyledTreeItem>
                          ))}
                      </StyledTreeItem>
                    ))}
                  </TreeView>
                </Box>
              </Scrollbar>
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Typography color="textPrimary" variant="subtitle2">
                No glossaries found
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
GlossarySearch.propTypes = {
  setQuery: PropTypes.func.isRequired,
  matches: PropTypes.array.isRequired
};
export default GlossarySearch;
