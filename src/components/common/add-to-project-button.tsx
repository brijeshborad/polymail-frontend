import styles from "@/styles/Inbox.module.css";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
} from "@chakra-ui/react";
import {SearchIcon, SmallAddIcon} from "@chakra-ui/icons";
import {FolderIcon, DisneyIcon} from "@/icons";
import React, {useCallback, useEffect, useRef} from "react";
import {Project} from "@/models";
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import CreateNewProjectModal from "@/components/project/create-new-project";

//import {useState} from "react";

export function AddToProjectButton() {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const dispatch = useDispatch();
  const {selectedThread} = useSelector((state: StateType) => state.threads);
  //const [successMessage, setSuccessMessage] = useState<{ desc: string, title: string } | null>(null);

  let {projects} = useSelector((state: StateType) => state.projects);

  const addToProjectRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleShortcutKeyPress = (e: KeyboardEvent | any) => {

      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (addToProjectRef.current) {
          addToProjectRef.current?.focus();
          addToProjectRef.current?.click();
        }
      }
    };
    window.addEventListener('keydown', handleShortcutKeyPress);
    return () => {
      window.removeEventListener('keydown', handleShortcutKeyPress);
    };
  }, []);

  const addThreadToProject = useCallback((item: Project) => {

    if (selectedThread && selectedThread.id) {
      let reqBody = {
        threadIds: [
          selectedThread.id,
        ],
        roles: [
          'n/a',
        ],
        groupType: 'project',
        groupId: item.id
      }
      dispatch(addItemToGroup(reqBody));
      /*
      setSuccessMessage({
          desc: 'Thread was added to ' + item.name?.toLowerCase() + '.',
          title: selectedThread?.subject || '',
      })
      */
    }
  }, [dispatch, selectedThread]);

  return (
    <>
      <Menu>
        <MenuButton
          className={styles.addToProject}
          leftIcon={<FolderIcon/>}
          borderRadius={'50px'}
          backgroundColor={'#2A6FFF'}
          color={'#FFFFFF'}
          as={Button}
          boxShadow={'0 0 3px 0 rgba(38, 109, 240, 0.12)'}
          padding={'4px 4px 4px 8px'}
          fontSize={'12px'} fontWeight={500}
          h={'fit-content'}
          ref={addToProjectRef}
        >
          Add to Project
          <span className={styles.RightContent}>⌘P</span>
        </MenuButton>
        <MenuList className={`${styles.addToProjectList} drop-down-list`} zIndex={'overlay'}>

          <div className={'dropdown-searchbar'}>
            <InputGroup>
              <InputLeftElement h={'27px'} pointerEvents='none'>
                <SearchIcon/>
              </InputLeftElement>
              <Input placeholder='Search project'/>
            </InputGroup>
          </div>

          {projects && !!projects.length && (projects || []).map((item: Project, index: number) => (
            <MenuItem gap={2} key={index} onClick={() => addThreadToProject(item)}>
              <DisneyIcon/> {item.name}
            </MenuItem>

          ))}

          <div className={styles.addNewProject}>
            <Button backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                    justifyContent={'flex-start'} onClick={onOpen}>
              <div className={styles.plusIcon}>
                <SmallAddIcon/>
              </div>
              Create New Project
            </Button>
          </div>
        </MenuList>
      </Menu>

      <CreateNewProjectModal onOpen={onOpen} isOpen={isOpen} onClose={onClose}/>
    </>
  )
}
