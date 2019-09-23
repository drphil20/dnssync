#include <windows.h>
#include <time.h>
#include <stdio.h>
#include <stdlib.h>

int APIENTRY WinMain( HINSTANCE hInst, HINSTANCE hPrev, LPSTR lpCmdLine, int nCmdShow )
{
	printf("Yo\n");
	time_t seconds;
	seconds = time (NULL);

	FILE *fptr;
   	fptr = fopen("C:\\Users\\IEUser\\test.txt","w");
   	if(fptr == NULL)
   	{
     		printf("Error!");   
      		exit(1);             
   	}
   	fprintf(fptr,"%ld Test", seconds);
   	fclose(fptr);
	MessageBox( NULL, "Hello, World!", "Hi!", MB_OK );
	return 0;
}
